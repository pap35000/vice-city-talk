/*
 * Wires the page together: script editor, player, canvas loop, character
 * settings, exports, keyboard shortcuts and per-browser saving.
 */
(function () {
  "use strict";
  const { t } = ViceCityTalkI18n;
  const P = ViceCityTalkParser, Scene = ViceCityTalkScene, R = ViceCityTalkRecorder;
  const STORAGE_KEY = "vice-city-talk:v1";
  const LEGACY_STORAGE_KEY = "explainer-duo:v1";   // saves made before the rename
  const RELEASE = new Date(2026, 10, 19);

  const $ = (id) => document.getElementById(id);
  const cv = $("cv"), ctx = cv.getContext("2d");

  const daysLeft = () => Math.max(0, Math.ceil((RELEASE - new Date(new Date().toDateString())) / 864e5));
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // ---------- state ----------
  const state = {
    uiLang: "el",
    script: VICE_CITY_TALK_PRESETS[0].script,
    themeOverride: "",
    characters: clone(Scene.DEFAULT_CHARACTERS),
    speed: 1,
    autoNext: false
  };
  let parsed = { meta: { lang: "el", theme: "sunset" }, cast: ["", ""], clips: [], errors: [] };
  let recording = null;

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY) || "null");
      if (saved && typeof saved.script === "string") Object.assign(state, saved);
    } catch (e) { /* storage unavailable */ }
  }
  let saveTimer = 0;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
    }, 400);
  }

  // ---------- voices ----------
  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
  const allVoices = () => (synth ? synth.getVoices() : []);
  function getVoice(who) {
    const vs = allVoices();
    const ch = state.characters[who];
    if (ch && ch.voiceURI) { const v = vs.find((x) => x.voiceURI === ch.voiceURI); if (v) return v; }
    const lang = (parsed.meta.lang || "el").toLowerCase();
    const list = vs.filter((v) => v.lang.toLowerCase().startsWith(lang));
    return list.length ? list[who % list.length] : null;
  }

  // ---------- player ----------
  let endWaiter = null;
  const player = new ViceCityTalkPlayer({
    getVoice,
    getPitch: (who) => Number(state.characters[who] && state.characters[who].pitch) || 1,
    onChange: syncUI,
    onClipEnd: () => {
      if (endWaiter) { const f = endWaiter; endWaiter = null; f(); return; }
      if (state.autoNext && player.clipIdx < player.clips.length - 1) {
        setTimeout(() => { if (!player.playing && player.finished) { player.select(player.clipIdx + 1); start(); } }, 1400);
      }
    }
  });

  function start() {
    if (!player.clip) return;
    if (player.finished && !recording) {
      const next = player.clipIdx + 1 < player.clips.length ? player.clipIdx + 1 : 0;
      player.select(next);
    }
    player.play();
    if (player.sound && !getVoice(0) && !getVoice(1)) setStatus(t("noVoice", { lang: parsed.meta.lang }));
  }
  const toggle = () => (player.playing ? player.pause() : start());

  // ---------- script ----------
  function reparse() {
    parsed = P.parseScript(state.script, { vars: { days: daysLeft() } });
    const keepIdx = player.clipIdx;
    player.load(parsed.clips);
    if (keepIdx < parsed.clips.length) player.clipIdx = keepIdx;
    renderErrors();
    renderClips();
    renderCast();
    renderSRT();
    syncUI();
  }

  function renderErrors() {
    const box = $("errors");
    box.textContent = "";
    if (!parsed.errors.length) {
      const p = document.createElement("p"); p.className = "ok"; p.textContent = "✓ " + t("noErrors"); box.appendChild(p);
    } else {
      const h = document.createElement("strong"); h.textContent = t("errors"); box.appendChild(h);
      const ul = document.createElement("ul");
      parsed.errors.forEach((e) => { const li = document.createElement("li"); li.textContent = (e.line ? `${t("lineN")} ${e.line}: ` : "") + e.msg; ul.appendChild(li); });
      box.appendChild(ul);
    }
    const lines = parsed.clips.reduce((s, c) => s + c.lines.length, 0);
    $("stats").textContent = `${parsed.clips.length} ${t("statsClips")} · ${lines} ${t("statsLines")}`;
  }

  function renderClips() {
    const box = $("clips");
    box.textContent = "";
    parsed.clips.forEach((c, i) => {
      const b = document.createElement("button");
      b.className = "clip"; b.id = "clip-" + i;
      const secs = Math.round(P.clipDuration(c, state.speed) / 1000);
      const no = document.createElement("span"); no.className = "no"; no.textContent = `${t("clip")} ${i + 1} · ~${secs}″`;
      const ttl = document.createElement("span"); ttl.className = "ttl"; ttl.textContent = c.title;
      const pts = document.createElement("span"); pts.className = "pts"; pts.textContent = c.points || `${c.lines.length} ${t("statsLines")}`;
      b.append(no, ttl, pts);
      b.onclick = () => { if (recording) return; player.select(i); start(); };
      box.appendChild(b);
    });
  }

  function renderTranscript() {
    const ol = $("transcript");
    ol.textContent = "";
    const c = player.clip;
    if (!c) return;
    c.lines.forEach((l, i) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.id = "line-" + i;
      const who = document.createElement("span"); who.className = "who"; who.dataset.slot = l.who; who.textContent = parsed.cast[l.who];
      const txt = document.createElement("span"); txt.textContent = l.text;
      b.append(who, txt);
      b.onclick = () => { if (!recording) player.jump(i); };
      li.appendChild(b); ol.appendChild(li);
    });
    ol.dataset.clip = player.clipIdx;
  }

  // ---------- UI sync ----------
  function setStatus(s) { $("status").textContent = s; }

  let lastClip = -1, lastLine = -2, lastClips = null;
  function syncUI() {
    const c = player.clip;
    const play = $("play");
    if (player.playing) play.textContent = t("pause");
    else if (player.finished) play.textContent = player.clipIdx < player.clips.length - 1 ? t("nextClip") : t("again");
    else if (player.lineIdx >= 0) play.textContent = t("resume");
    else play.textContent = t("play");

    if (!recording) {
      if (player.playing && c) setStatus(t("statusPlaying", { title: c.title }));
      else if (player.finished) setStatus(t("statusEnd", { n: player.clipIdx + 1, total: player.clips.length }));
      else if (player.lineIdx >= 0) setStatus(t("statusPaused"));
      else setStatus(t("statusIdle"));
    }

    document.querySelectorAll(".clip").forEach((b, i) => b.setAttribute("aria-pressed", String(i === player.clipIdx)));
    if (lastClip !== player.clipIdx || lastClips !== player.clips) {
      renderTranscript(); renderSRT();
      lastClip = player.clipIdx; lastClips = player.clips; lastLine = -2;
    }
    if (lastLine !== player.lineIdx) {
      document.querySelectorAll("#transcript button").forEach((b, i) => {
        const on = i === player.lineIdx;
        b.setAttribute("aria-current", String(on));
        if (on) b.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
      const line = player.line;
      if (line && player.playing) $("live").textContent = `${parsed.cast[line.who]}: ${line.text}`;
      lastLine = player.lineIdx;
    }
  }

  // ---------- canvas loop ----------
  function frame(now) {
    const c = player.clip;
    Scene.draw(ctx, {
      t: now,
      theme: state.themeOverride || parsed.meta.theme,
      characters: state.characters,
      cast: parsed.cast,
      clip: c,
      clipIdx: player.clipIdx,
      clipCount: player.clips.length,
      line: player.line,
      lineAge: player.lineAge,
      playing: player.playing,
      finished: player.finished,
      showTitle: !player.playing && (player.lineIdx < 0 || player.finished),
      progress: player.progress(),
      lang: parsed.meta.lang,
      badge: recording ? "●" : "▶",
      labels: { clip: t("clip"), end: t("end") },
      hint: recording ? "" : player.finished ? t("pressNext") : t("pressPlay")
    });
    requestAnimationFrame(frame);
  }

  // ---------- characters ----------
  const HAIR = ["short", "long", "bun", "curly"];
  const ACC = ["none", "sunglasses", "glasses", "earrings", "cap"];
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  function renderCast() {
    const box = $("cast");
    box.textContent = "";
    const vs = allVoices().slice().sort((a, b) => {
      const l = parsed.meta.lang;
      return (b.lang.startsWith(l) - a.lang.startsWith(l)) || a.name.localeCompare(b.name);
    });
    [0, 1].forEach((slot) => {
      const ch = state.characters[slot];
      const fs = document.createElement("fieldset");
      const lg = document.createElement("legend");
      lg.textContent = `${parsed.cast[slot] || t("character")} · ${slot === 0 ? t("left") : t("right")}`;
      fs.appendChild(lg);

      const add = (key, el) => {
        const id = `ch${slot}-${key}`; el.id = id;
        const lb = document.createElement("label"); lb.htmlFor = id; lb.textContent = t(key);
        fs.append(lb, el);
      };
      const color = (key) => {
        const i = document.createElement("input"); i.type = "color"; i.value = ch[key];
        i.oninput = () => { ch[key] = i.value; save(); };
        add(key, i);
      };
      const select = (key, opts, labelFor) => {
        const s = document.createElement("select");
        opts.forEach((v) => { const o = document.createElement("option"); o.value = v; o.textContent = labelFor(v); s.appendChild(o); });
        s.value = ch[key] || opts[0];
        s.onchange = () => { ch[key] = s.value; save(); };
        add(key, s);
      };

      color("shirt"); color("pattern"); color("skin"); color("hair");
      select("hairStyle", HAIR, (v) => t("hair" + cap(v)));
      select("accessory", ACC, (v) => t("acc" + cap(v)));

      const pitch = document.createElement("input");
      pitch.type = "range"; pitch.min = "0.5"; pitch.max = "2"; pitch.step = "0.05"; pitch.value = ch.pitch;
      pitch.onchange = () => { ch.pitch = Number(pitch.value); save(); player.restartLine(); };
      add("pitch", pitch);

      const voice = document.createElement("select");
      const auto = document.createElement("option"); auto.value = ""; auto.textContent = t("voiceAuto"); voice.appendChild(auto);
      vs.forEach((v) => { const o = document.createElement("option"); o.value = v.voiceURI; o.textContent = `${v.name} (${v.lang})`; voice.appendChild(o); });
      voice.value = vs.some((v) => v.voiceURI === ch.voiceURI) ? ch.voiceURI : "";
      voice.onchange = () => { ch.voiceURI = voice.value; save(); player.restartLine(); };
      add("voice", voice);

      box.appendChild(fs);
    });
  }

  // ---------- exports ----------
  function renderSRT() {
    const c = player.clip;
    $("srt").value = c ? P.toSRT(c, parsed.cast, { speed: state.speed, offsetMs: 1500 }) : "";
  }
  const clipFile = (ext) => `${R.slug(player.clip ? player.clip.title : "clip")}.${ext}`;

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); setStatus(t("copied")); }
    catch (e) { $("srt").select(); setStatus(t("copyFailed")); }
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let videoBlob = null;

  async function recordVideo() {
    if (recording) { if (endWaiter) { const f = endWaiter; endWaiter = null; f(); } return; }
    if (!R.supported()) { setStatus(t("recUnsupported")); return; }
    if (!player.clip) return;
    const btn = $("record");
    player.select(player.clipIdx);
    player.silent = true;
    recording = R.start(cv, 30);
    btn.textContent = t("stopRecording"); btn.classList.add("rec");
    setStatus(t("recording"));
    const ended = new Promise((res) => { endWaiter = res; });
    await sleep(1500);                         // title card at the start of the video
    if (endWaiter) player.play();
    await ended;
    player.pause();
    await sleep(900);
    const rec = recording;
    videoBlob = await rec.stop();
    recording = null; player.silent = false;
    btn.textContent = t("recordVideo"); btn.classList.remove("rec");
    const v = $("video-preview");
    if (v.src) URL.revokeObjectURL(v.src);
    v.src = URL.createObjectURL(videoBlob);
    $("video-out").hidden = false;
    $("video-download").dataset.ext = rec.ext;
    syncUI();
    setStatus(t("videoReady"));
  }

  function exportProject() {
    const data = { app: "vice-city-talk", version: 1, script: state.script, characters: state.characters, themeOverride: state.themeOverride };
    R.download("vice-city-talk-project.json", JSON.stringify(data, null, 2), "application/json");
  }

  function importProject(file) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const d = JSON.parse(fr.result);
        if (!["vice-city-talk", "explainer-duo"].includes(d.app) || typeof d.script !== "string") throw new Error("bad file");
        state.script = d.script;
        if (Array.isArray(d.characters) && d.characters.length === 2) state.characters = d.characters.map((c, i) => Object.assign(clone(Scene.DEFAULT_CHARACTERS[i]), c));
        state.themeOverride = d.themeOverride || "";
        $("script").value = state.script; $("theme").value = state.themeOverride || parsed.meta.theme;
        save(); reparse(); setStatus(t("imported"));
      } catch (e) { setStatus(t("importFailed")); }
    };
    fr.readAsText(file);
  }

  // ---------- language ----------
  function setLang(l) {
    state.uiLang = l; ViceCityTalkI18n.lang = l;
    ViceCityTalkI18n.apply(document);
    $("lang-el").setAttribute("aria-pressed", String(l === "el"));
    $("lang-en").setAttribute("aria-pressed", String(l === "en"));
    $("sound").textContent = player.sound ? t("soundOn") : t("soundOff");
    if (!recording) $("record").textContent = t("recordVideo");
    renderErrors(); renderClips(); renderCast(); syncUI();
    save();
  }

  // ---------- tabs ----------
  function selectTab(btn) {
    document.querySelectorAll('[role="tab"]').forEach((b) => {
      const on = b === btn;
      b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1;
      $(b.getAttribute("aria-controls")).hidden = !on;
    });
  }

  // ---------- events ----------
  function bind() {
    $("play").onclick = toggle;
    cv.onclick = () => { if (!recording) toggle(); };
    $("prev").onclick = () => !recording && player.step(-1);
    $("next").onclick = () => !recording && player.step(1);
    $("restart").onclick = () => { if (recording) return; player.select(player.clipIdx); start(); };
    $("sound").onclick = () => {
      player.sound = !player.sound;
      $("sound").setAttribute("aria-pressed", String(player.sound));
      $("sound").textContent = player.sound ? t("soundOn") : t("soundOff");
      player.restartLine();
    };
    $("speed").onchange = (e) => { state.speed = player.speed = Number(e.target.value); renderClips(); renderSRT(); syncUI(); player.restartLine(); save(); };
    $("theme").onchange = (e) => { state.themeOverride = e.target.value === parsed.meta.theme ? "" : e.target.value; save(); };
    $("auto-next").onchange = (e) => { state.autoNext = e.target.checked; save(); };
    $("fullscreen").onclick = toggleFullscreen;
    $("lang-el").onclick = () => setLang("el");
    $("lang-en").onclick = () => setLang("en");

    const presetSel = $("preset");
    VICE_CITY_TALK_PRESETS.forEach((p) => { const o = document.createElement("option"); o.value = p.id; o.textContent = p.label; presetSel.appendChild(o); });
    $("load-preset").onclick = () => {
      const p = VICE_CITY_TALK_PRESETS.find((x) => x.id === presetSel.value);
      if (!p) return;
      state.script = p.script; state.themeOverride = "";
      $("script").value = p.script;
      player.clipIdx = 0; save(); reparse();
      $("theme").value = parsed.meta.theme;
    };

    let typing = 0;
    $("script").oninput = (e) => {
      state.script = e.target.value;
      clearTimeout(typing);
      typing = setTimeout(() => { save(); reparse(); if (!state.themeOverride) $("theme").value = parsed.meta.theme; }, 350);
    };

    $("reset-cast").onclick = () => { state.characters = clone(Scene.DEFAULT_CHARACTERS); save(); renderCast(); };
    $("record").onclick = recordVideo;
    $("video-download").onclick = (e) => { if (videoBlob) R.download(clipFile(e.target.dataset.ext || "webm"), videoBlob); };
    $("srt-download").onclick = () => R.download(clipFile("srt"), $("srt").value, "application/x-subrip;charset=utf-8");
    $("srt-copy").onclick = () => copyText($("srt").value);
    $("json-export").onclick = exportProject;
    $("json-import").onchange = (e) => { if (e.target.files[0]) importProject(e.target.files[0]); e.target.value = ""; };

    const tabs = [...document.querySelectorAll('[role="tab"]')];
    tabs.forEach((b, i) => {
      b.onclick = () => selectTab(b);
      b.onkeydown = (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
        selectTab(n); n.focus();
      };
    });

    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || recording) return;
      const tag = (e.target.tagName || "").toLowerCase();
      if (["textarea", "input", "select"].includes(tag) || e.target.getAttribute("role") === "tab") return;
      const k = e.key.toLowerCase();
      if (k === " " || k === "k") { if (tag === "button") return; e.preventDefault(); toggle(); }
      else if (k === "arrowleft") player.step(-1);
      else if (k === "arrowright") player.step(1);
      else if (k === "r") { player.select(player.clipIdx); start(); }
      else if (k === "m") $("sound").click();
      else if (k === "f") toggleFullscreen();
      else if (/^[1-9]$/.test(k) && Number(k) <= player.clips.length) { player.select(Number(k) - 1); start(); }
    });

    if (synth) synth.addEventListener ? synth.addEventListener("voiceschanged", renderCast) : (synth.onvoiceschanged = renderCast);
    document.addEventListener("visibilitychange", () => { if (document.hidden && player.playing && !recording) player.pause(); });
  }

  function toggleFullscreen() {
    const stage = $("stage");
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (stage.requestFullscreen) stage.requestFullscreen().catch(() => {});
    } catch (e) { /* fullscreen not allowed here */ }
  }

  // ---------- boot ----------
  load();
  ViceCityTalkI18n.lang = state.uiLang;
  player.speed = state.speed;
  bind();
  $("script").value = state.script;
  $("speed").value = String(state.speed);
  $("auto-next").checked = !!state.autoNext;
  reparse();
  $("theme").value = state.themeOverride || parsed.meta.theme;
  setLang(state.uiLang);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(frame));
})();
