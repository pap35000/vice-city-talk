/*
 * Playback engine: steps through the lines of a clip, speaks them with the
 * Web Speech API when a voice is available, and falls back to timed lines.
 */
(function (root) {
  "use strict";
  const P = root.ExplainerParser;

  class Player {
    constructor(opts) {
      this.getVoice = opts.getVoice;          // (who) => SpeechSynthesisVoice | null
      this.getPitch = opts.getPitch;          // (who) => number
      this.onChange = opts.onChange || (() => {});
      this.onClipEnd = opts.onClipEnd || (() => {});
      this.clips = [];
      this.clipIdx = 0;
      this.lineIdx = -1;
      this.playing = false;
      this.finished = false;
      this.lineStart = 0;
      this.token = 0;
      this.speed = 1;
      this.sound = true;
      this.silent = false;                    // forced timing mode, used while recording
    }

    get clip() { return this.clips[this.clipIdx] || null; }
    get line() { return this.clip && this.lineIdx >= 0 ? this.clip.lines[this.lineIdx] || null : null; }
    get lineAge() { return performance.now() - this.lineStart; }

    load(clips) {
      this.halt();
      this.clips = clips;
      this.clipIdx = Math.max(0, Math.min(this.clipIdx, clips.length - 1));
      this.lineIdx = -1;
      this.finished = false;
      this.emit();
    }

    emit() { this.onChange(this); }

    halt() {
      this.playing = false;
      this.token++;
      try { if ("speechSynthesis" in window) speechSynthesis.cancel(); } catch (e) { /* not supported */ }
    }

    play() {
      if (!this.clip) return;
      if (this.finished) { this.lineIdx = -1; this.finished = false; }
      this.playing = true;
      this.playLine(Math.max(0, this.lineIdx));
    }

    pause() { this.halt(); this.emit(); }

    select(i) {
      this.halt();
      this.clipIdx = Math.max(0, Math.min(i, this.clips.length - 1));
      this.lineIdx = -1;
      this.finished = false;
      this.emit();
    }

    jump(i) {
      if (!this.clip) return;
      const wasPlaying = this.playing;
      this.halt();
      this.finished = false;
      this.lineIdx = Math.max(0, Math.min(i, this.clip.lines.length - 1));
      this.lineStart = performance.now();
      if (wasPlaying) { this.playing = true; this.playLine(this.lineIdx); } else this.emit();
    }

    step(delta) { this.jump((this.lineIdx < 0 ? 0 : this.lineIdx) + delta); }

    restartLine() { if (this.playing) { this.halt(); this.playing = true; this.playLine(this.lineIdx); } }

    playLine(i) {
      const my = ++this.token;
      const lines = this.clip.lines;
      if (i >= lines.length) {
        this.lineIdx = lines.length - 1;
        this.playing = false;
        this.finished = true;
        this.emit();
        this.onClipEnd(this);
        return;
      }
      this.lineIdx = i;
      this.lineStart = performance.now();
      this.emit();

      const line = lines[i];
      const duration = P.estimateDuration(line.text, this.speed);
      const next = () => {
        if (my !== this.token || !this.playing) return;
        setTimeout(() => { if (my === this.token && this.playing) this.playLine(i + 1); }, P.GAP_MS);
      };

      const voice = this.sound && !this.silent ? this.getVoice(line.who) : null;
      if (!voice) { setTimeout(next, duration); return; }

      const u = new SpeechSynthesisUtterance(line.text);
      u.voice = voice;
      u.lang = voice.lang;
      u.pitch = this.getPitch(line.who);
      u.rate = 1.05 * this.speed;
      let done = false;
      const end = () => { if (!done) { done = true; next(); } };
      u.onend = end;
      u.onerror = end;
      setTimeout(end, duration * 2 + 2500);   // some browsers never fire onend
      speechSynthesis.speak(u);
    }

    progress() {
      const c = this.clip;
      if (!c || this.lineIdx < 0) return 0;
      if (this.finished) return 1;
      const part = Math.min(1, this.lineAge / P.estimateDuration(c.lines[this.lineIdx].text, this.speed));
      return (this.lineIdx + (this.playing ? part : 0)) / c.lines.length;
    }
  }

  root.ExplainerPlayer = Player;
})(window);
