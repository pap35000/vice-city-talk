/*
 * Script parser for Explainer Duo.
 *
 * Format (one statement per line):
 *   @lang el              language of the voices and tag labels
 *   @theme sunset         background: sunset | night | studio
 *   @cast Τάκης, Λένα     the two characters, left then right
 *   # Clip title          starts a new clip
 *   > Short description   description shown on the clip card
 *   Name [tag]: Text {Big caption}
 *   // comment
 *
 * {{days}} and other {{vars}} are replaced before parsing a line.
 * Works in the browser (window.ExplainerParser) and in Node (module.exports).
 */
(function (root) {
  "use strict";

  const TAG_ALIASES = {
    ok: "ok", confirmed: "ok", "επιβεβαιωμενο": "ok",
    rep: "rep", reported: "rep", "αναφορα": "rep",
    unc: "unc", unconfirmed: "unc", rumor: "unc", "φημη": "unc", "ανεπιβεβαιωτο": "unc"
  };
  const THEMES = ["sunset", "night", "studio"];
  const GAP_MS = 450;
  const MAX_CAST = 2;

  function normalize(s) {
    return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  }

  function parseScript(text, opts) {
    const vars = (opts && opts.vars) || {};
    const out = { meta: { lang: "el", theme: "sunset" }, cast: [], clips: [], errors: [] };
    const castKeys = [];
    let castFixed = false;
    let clip = null;

    const err = (line, msg) => out.errors.push({ line, msg });
    const newClip = (title) => {
      clip = { title: title || `Clip ${out.clips.length + 1}`, points: "", lines: [] };
      out.clips.push(clip);
    };

    String(text).split(/\r?\n/).forEach((raw, i) => {
      const n = i + 1;
      const line = raw.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? String(vars[k]) : m)).trim();
      if (!line || line.startsWith("//")) return;

      if (line.startsWith("@")) {
        const m = line.match(/^@(\w+)\s+(.+)$/);
        if (!m) return err(n, "Directive needs a value, e.g. @lang el");
        const key = m[1].toLowerCase(), val = m[2].trim();
        if (key === "lang") out.meta.lang = val.toLowerCase();
        else if (key === "theme") {
          if (!THEMES.includes(val.toLowerCase())) return err(n, `Unknown theme "${val}" (use ${THEMES.join(", ")})`);
          out.meta.theme = val.toLowerCase();
        } else if (key === "cast") {
          const names = val.split(",").map((s) => s.trim()).filter(Boolean);
          if (names.length !== MAX_CAST) return err(n, `@cast needs exactly ${MAX_CAST} names`);
          out.cast = names; castKeys.length = 0; names.forEach((s) => castKeys.push(normalize(s))); castFixed = true;
        } else err(n, `Unknown directive @${m[1]}`);
        return;
      }

      if (line.startsWith("#")) return newClip(line.replace(/^#+/, "").trim());

      if (line.startsWith(">")) {
        if (!clip) return err(n, "Description (>) must come after a clip title (#)");
        clip.points = (clip.points ? clip.points + " " : "") + line.slice(1).trim();
        return;
      }

      const m = line.match(/^([^:[\]{}]+?)\s*(?:\[([^\]]+)\])?\s*:\s*(.*)$/);
      if (!m) return err(n, 'Expected "Name: text"');

      const key = normalize(m[1]);
      let who = castKeys.indexOf(key);
      if (who < 0) {
        if (castFixed || castKeys.length >= MAX_CAST) return err(n, `Unknown character "${m[1].trim()}"`);
        castKeys.push(key); out.cast.push(m[1].trim()); who = castKeys.length - 1;
      }

      let tag = null;
      if (m[2]) {
        tag = TAG_ALIASES[normalize(m[2])];
        if (!tag) return err(n, `Unknown tag [${m[2]}] (use ok, rep, unc)`);
      }

      let body = m[3].trim(), big = null;
      const bm = body.match(/\{([^{}]+)\}\s*$/);
      if (bm) { big = bm[1].trim(); body = body.slice(0, bm.index).trim(); }
      if (!body) return err(n, "Line has no text");

      if (!clip) newClip("");
      clip.lines.push({ who, tag, text: body, big, src: n });
    });

    out.clips = out.clips.filter((c) => c.lines.length > 0);
    while (out.cast.length < MAX_CAST) out.cast.push(out.cast.length === 0 ? "A" : "B");
    if (!out.clips.length && !out.errors.length) err(0, "The script has no dialogue lines yet");
    return out;
  }

  function estimateDuration(text, speed) {
    return Math.max(2200, String(text).length * 62) / (speed || 1);
  }

  function clipDuration(clip, speed) {
    return clip.lines.reduce((s, l) => s + estimateDuration(l.text, speed) + GAP_MS, 0);
  }

  function srtTime(ms) {
    const p = (v, w) => String(Math.floor(v)).padStart(w || 2, "0");
    return `${p(ms / 3600000)}:${p((ms / 60000) % 60)}:${p((ms / 1000) % 60)},${p(ms % 1000, 3)}`;
  }

  function toSRT(clip, cast, opts) {
    const speed = (opts && opts.speed) || 1;
    let t = (opts && opts.offsetMs) || 0;
    return clip.lines.map((l, i) => {
      const d = estimateDuration(l.text, speed);
      const who = cast && cast[l.who] ? cast[l.who] + ": " : "";
      const block = `${i + 1}\n${srtTime(t)} --> ${srtTime(t + d)}\n${who}${l.text}\n`;
      t += d + GAP_MS;
      return block;
    }).join("\n");
  }

  const api = { parseScript, estimateDuration, clipDuration, toSRT, srtTime, normalize, THEMES, GAP_MS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ExplainerParser = api;
})(typeof window !== "undefined" ? window : globalThis);
