/*
 * Canvas 2D renderer: backgrounds, the two characters, speech bubbles,
 * big captions and the on-screen HUD. Pure drawing; it keeps no playback state.
 */
(function (root) {
  "use strict";

  const W = 1280, H = 720;
  const SLOTS = [{ x: 360, face: 1 }, { x: 920, face: -1 }];
  const FONT = "Commissioner, system-ui, sans-serif";
  const DISPLAY = "Play, Commissioner, sans-serif";

  const TAGS = {
    el: { ok: "ΕΠΙΒΕΒΑΙΩΜΕΝΟ", rep: "ΑΝΑΦΟΡΑ", unc: "ΑΝΕΠΙΒΕΒΑΙΩΤΟ" },
    en: { ok: "CONFIRMED", rep: "REPORTED", unc: "UNCONFIRMED" }
  };
  const TAG_COLORS = { ok: "#2ecc71", rep: "#f5b82e", unc: "#ff5a5a" };

  const DEFAULT_CHARACTERS = [
    { shirt: "#2fe0c8", pattern: "#ffb347", skin: "#e9b48a", hair: "#2a1a12", hairStyle: "short", accessory: "sunglasses", pitch: 0.75, voiceURI: "" },
    { shirt: "#ff4fa3", pattern: "#ffffff", skin: "#c98a62", hair: "#5a2a1a", hairStyle: "long", accessory: "earrings", pitch: 1.35, voiceURI: "" }
  ];

  let ctx;
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
  const circle = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };

  // ---------- backgrounds ----------
  function skyline(baseY, color, windowColor, seed) {
    const blocks = [[60, 110], [120, 170], [170, 130], [230, 200], [290, 120], [960, 150], [1020, 220], [1090, 140], [1150, 180], [1210, 120]];
    ctx.fillStyle = color;
    blocks.forEach(([x, h]) => ctx.fillRect(x, baseY - h, 52, h));
    ctx.fillStyle = windowColor;
    blocks.forEach(([x, h], i) => {
      for (let wy = baseY - h + 12; wy < baseY - 10; wy += 18)
        for (let wx = x + 8; wx < x + 46; wx += 14)
          if ((wx * 7 + wy * 3 + i + seed) % 5 < 2) ctx.fillRect(wx, wy, 6, 8);
    });
  }

  function palm(x, y, dir, t) {
    ctx.strokeStyle = "#0d0619"; ctx.lineWidth = 16; ctx.lineCap = "round";
    const sway = Math.sin(t / 1200) * 8;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 30 * dir, y - 160, x + 10 * dir + sway, y - 300); ctx.stroke();
    const tx = x + 10 * dir + sway, ty = y - 300;
    ctx.fillStyle = "#0d0619";
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI + (i / 6) * Math.PI + Math.sin(t / 900 + i) * 0.05;
      ctx.save(); ctx.translate(tx, ty); ctx.rotate(a);
      ctx.beginPath(); ctx.ellipse(70, 10, 80, 14, 0.35, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }

  function stars(t, count, maxY) {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < count; i++) {
      ctx.globalAlpha = 0.3 + 0.3 * Math.sin(t / 700 + i);
      ctx.fillRect((i * 197) % W, (i * 83) % maxY, 2, 2);
    }
    ctx.globalAlpha = 1;
  }

  function sunset(t) {
    const sky = ctx.createLinearGradient(0, 0, 0, 470);
    sky.addColorStop(0, "#1b0f3a"); sky.addColorStop(0.45, "#6b1d6e"); sky.addColorStop(0.8, "#ff4f8b"); sky.addColorStop(1, "#ffb347");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, 470);
    stars(t, 40, 200);
    const sunY = 400;
    ctx.save(); ctx.beginPath(); ctx.arc(W / 2, sunY, 150, Math.PI, 0); ctx.clip();
    const sg = ctx.createLinearGradient(0, sunY - 150, 0, sunY); sg.addColorStop(0, "#ffe27a"); sg.addColorStop(1, "#ff5f8f");
    ctx.fillStyle = sg; ctx.fillRect(W / 2 - 150, sunY - 150, 300, 150);
    ctx.fillStyle = "#c2307a";
    for (let k = 0; k < 6; k++) ctx.fillRect(W / 2 - 150, sunY - 60 + k * 11 + ((t / 90) % 11), 300, 3 + k);
    ctx.restore();
    const sea = ctx.createLinearGradient(0, 400, 0, 560); sea.addColorStop(0, "#3b1a66"); sea.addColorStop(1, "#140b2b");
    ctx.fillStyle = sea; ctx.fillRect(0, 400, W, 160);
    ctx.strokeStyle = "rgba(255,180,120,.35)"; ctx.lineWidth = 2;
    for (let k = 0; k < 7; k++) {
      const yy = 415 + k * 18, off = Math.sin(t / 800 + k) * 30;
      ctx.beginPath(); ctx.moveTo(W / 2 - 160 + k * 8 + off, yy); ctx.lineTo(W / 2 + 160 - k * 8 + off, yy); ctx.stroke();
    }
    skyline(400, "#1a0c30", "rgba(255,210,120,.55)", 0);
    const sand = ctx.createLinearGradient(0, 540, 0, H); sand.addColorStop(0, "#3d2244"); sand.addColorStop(1, "#24132e");
    ctx.fillStyle = sand; ctx.beginPath(); ctx.moveTo(0, 560); ctx.quadraticCurveTo(W / 2, 520, W, 560); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    palm(130, 600, 1, t); palm(1160, 610, -1, t + 900);
  }

  function night(t) {
    const sky = ctx.createLinearGradient(0, 0, 0, 560);
    sky.addColorStop(0, "#050816"); sky.addColorStop(1, "#1b2350");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, 560);
    stars(t, 70, 320);
    ctx.fillStyle = "#f3f0d8"; circle(1040, 120, 46);
    ctx.fillStyle = "#1b2350"; circle(1060, 108, 40);
    skyline(560, "#0b0f26", "rgba(120,220,255,.55)", 3);
    // neon sign
    const flick = Math.sin(t / 60) > -0.95 ? 1 : 0.3;
    ctx.save(); ctx.globalAlpha = flick;
    ctx.font = `700 30px ${DISPLAY}`; ctx.textAlign = "center"; ctx.shadowColor = "#ff4fa3"; ctx.shadowBlur = 24;
    ctx.fillStyle = "#ff8ac4"; ctx.fillText("VICE", 1046, 326);
    ctx.restore();
    ctx.fillStyle = "#12142e"; ctx.fillRect(0, 560, W, H - 560);
    ctx.strokeStyle = "rgba(47,224,200,.5)"; ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const x = ((i * 120 + t / 20) % (W + 120)) - 60;
      ctx.beginPath(); ctx.moveTo(x, 600); ctx.lineTo(x + 50, 600); ctx.stroke();
    }
  }

  function studio(t) {
    const bg = ctx.createRadialGradient(W / 2, 260, 60, W / 2, 300, 760);
    bg.addColorStop(0, "#3a2f6b"); bg.addColorStop(1, "#140f2a");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,.04)";
    for (let i = 0; i < 8; i++) { rr(80 + i * 145, 90, 110, 330, 16); ctx.fill(); }
    ctx.fillStyle = "#1c163a"; ctx.fillRect(0, 560, W, H - 560);
    const spot = ctx.createRadialGradient(W / 2, 640, 20, W / 2, 640, 520);
    spot.addColorStop(0, "rgba(255,226,122,.18)"); spot.addColorStop(1, "rgba(255,226,122,0)");
    ctx.fillStyle = spot; ctx.fillRect(0, 380, W, H - 380);
    ctx.fillStyle = `rgba(255,79,163,${0.5 + 0.2 * Math.sin(t / 600)})`; ctx.fillRect(0, 556, W, 4);
  }

  const BACKGROUNDS = { sunset, night, studio };

  // ---------- characters ----------
  function person(ch, slot, name, t, talking, active) {
    const { x: baseX, face } = SLOTS[slot];
    const bob = Math.sin(t / 500 + slot * 1.7) * 4 + (talking ? Math.sin(t / 120) * 2 : 0);
    const x = baseX + (active ? 14 * face : 0), feet = 640, y = feet + bob;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(x, feet + 8, 70, 12, 0, 0, Math.PI * 2); ctx.fill();
    // legs
    ctx.strokeStyle = "#20163a"; ctx.lineWidth = 22; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x - 20, y - 120); ctx.lineTo(x - 26, feet); ctx.moveTo(x + 20, y - 120); ctx.lineTo(x + 26, feet); ctx.stroke();
    // arms
    ctx.strokeStyle = ch.skin; ctx.lineWidth = 18;
    const wave = talking ? Math.sin(t / 180) * 0.6 : Math.sin(t / 900) * 0.08;
    arm(x - 52, y - 240, -1, 0.25 + (face < 0 ? wave : 0));
    arm(x + 52, y - 240, 1, 0.25 + (face > 0 ? wave : 0));
    // torso with pattern
    ctx.fillStyle = ch.shirt; rr(x - 58, y - 260, 116, 150, 30); ctx.fill();
    ctx.fillStyle = ch.pattern; ctx.globalAlpha = 0.55;
    for (let i = 0; i < 9; i++) circle(x - 38 + (i % 3) * 38, y - 230 + Math.floor(i / 3) * 42, 7);
    ctx.globalAlpha = 1;
    // neck and head
    ctx.fillStyle = ch.skin; ctx.fillRect(x - 12, y - 280, 24, 26);
    const hx = x + (talking ? Math.sin(t / 260) * 3 : 0), hy = y - 330;
    if (ch.hairStyle === "long") { ctx.fillStyle = ch.hair; rr(hx - 62, hy - 40, 124, 130, 50); ctx.fill(); }
    ctx.fillStyle = ch.skin; circle(hx, hy, 56);
    hair(ch, hx, hy);
    // eyes
    const blink = (Math.floor(t / 100) + slot * 13) % 38 === 0 ? 0.15 : 1;
    const look = 6 * face;
    ctx.fillStyle = "#1a1026";
    [-20, 20].forEach((dx) => { ctx.beginPath(); ctx.ellipse(hx + dx + look, hy + 2, 7, 9 * blink, 0, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = "rgba(255,90,120,.25)";
    [-34, 34].forEach((dx) => circle(hx + dx, hy + 22, 9));
    accessory(ch, hx, hy, look);
    // mouth
    ctx.fillStyle = "#4a1020"; ctx.strokeStyle = "#4a1020"; ctx.lineWidth = 4;
    if (talking) {
      const open = 4 + Math.abs(Math.sin(t / 85) * Math.sin(t / 37)) * 14;
      ctx.beginPath(); ctx.ellipse(hx + look, hy + 30, 14, open, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(hx + look, hy + 22, 14, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
    }
    // name plate
    ctx.font = `800 22px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const nw = ctx.measureText(name).width + 28;
    ctx.fillStyle = active ? ch.shirt : "rgba(255,255,255,.12)"; rr(x - nw / 2, feet + 26, nw, 34, 17); ctx.fill();
    ctx.fillStyle = active ? "#140b22" : "#e8dcff"; ctx.fillText(name, x, feet + 44);
    ctx.restore();

    function arm(sx, sy, side, a) {
      const ex = sx + Math.sin(a) * 70 * side, ey = sy + Math.cos(a) * 70;
      const raise = side === face && talking ? -60 : 0;
      ctx.beginPath(); ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx + 20 * side, sy + 40, ex + 10 * side, ey + 20 + raise); ctx.stroke();
      ctx.fillStyle = ch.skin; circle(ex + 10 * side, ey + 20 + raise, 12);
    }
  }

  function hair(ch, hx, hy) {
    ctx.fillStyle = ch.hair;
    if (ch.hairStyle === "short") {
      ctx.beginPath(); ctx.arc(hx, hy - 8, 58, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
    } else if (ch.hairStyle === "long") {
      ctx.beginPath(); ctx.arc(hx, hy - 6, 60, Math.PI, Math.PI * 2); ctx.fill();
    } else if (ch.hairStyle === "bun") {
      ctx.beginPath(); ctx.arc(hx, hy - 6, 59, Math.PI, Math.PI * 2); ctx.fill();
      circle(hx, hy - 70, 26);
    } else if (ch.hairStyle === "curly") {
      for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; circle(hx + Math.cos(a) * 54, hy - 6 + Math.sin(a) * 54, 20); }
    }
  }

  function accessory(ch, hx, hy, look) {
    if (ch.accessory === "sunglasses") {
      ctx.fillStyle = "#111"; rr(hx - 44, hy - 40, 36, 16, 6); ctx.fill(); rr(hx + 8, hy - 40, 36, 16, 6); ctx.fill();
      ctx.fillRect(hx - 8, hy - 36, 16, 4);
    } else if (ch.accessory === "glasses") {
      ctx.strokeStyle = "#111"; ctx.lineWidth = 4;
      [-20, 20].forEach((dx) => { ctx.beginPath(); ctx.arc(hx + dx + look, hy + 2, 15, 0, Math.PI * 2); ctx.stroke(); });
      ctx.beginPath(); ctx.moveTo(hx - 5 + look, hy); ctx.lineTo(hx + 5 + look, hy); ctx.stroke();
    } else if (ch.accessory === "earrings") {
      ctx.fillStyle = "#ffb347"; circle(hx + 54, hy + 12, 6); circle(hx - 54, hy + 12, 6);
    } else if (ch.accessory === "cap") {
      ctx.fillStyle = ch.pattern; ctx.beginPath(); ctx.arc(hx, hy - 14, 58, Math.PI, Math.PI * 2); ctx.fill();
      rr(hx - 10, hy - 22, 86, 14, 7); ctx.fill();
    }
  }

  // ---------- overlays ----------
  function wrap(text, maxW) {
    const out = []; let cur = "";
    for (const w of text.split(" ")) {
      const test = cur ? cur + " " + w : w;
      if (ctx.measureText(test).width > maxW && cur) { out.push(cur); cur = w; } else cur = test;
    }
    if (cur) out.push(cur);
    return out;
  }

  function bubble(line, age, lang) {
    const { x, face } = SLOTS[line.who];
    ctx.save();
    ctx.font = `600 28px ${FONT}`;
    const lines = wrap(line.text, 580);
    const label = line.tag ? (TAGS[lang] || TAGS.en)[line.tag] : null;
    const pad = 22, lh = 38;
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + pad * 2;
    const h = lines.length * lh + pad * 2 + (label ? 40 : 0);
    const bx = Math.max(24, Math.min(W - w - 24, x - w / 2 + 110 * face));
    const by = Math.max(72, 232 - h);
    const s = Math.min(1, age / 180), e = 1 - Math.pow(1 - s, 3);
    ctx.globalAlpha = e; ctx.translate(0, (1 - e) * 16);
    ctx.fillStyle = "#fffaf3"; ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 18;
    rr(bx, by, w, h, 22); ctx.fill();
    const tx = Math.max(bx + 30, Math.min(bx + w - 30, x + 20 * face));
    ctx.beginPath(); ctx.moveTo(tx - 16, by + h - 2); ctx.lineTo(tx + 16, by + h - 2); ctx.lineTo(x + 6 * face, Math.max(by + h + 20, 236)); ctx.fill();
    ctx.shadowBlur = 0;
    let ty = by + pad;
    if (label) {
      ctx.font = `800 16px ${FONT}`;
      const tw = ctx.measureText(label).width + 22;
      ctx.fillStyle = TAG_COLORS[line.tag]; rr(bx + pad, ty, tw, 28, 8); ctx.fill();
      ctx.fillStyle = "#130a1f"; ctx.textBaseline = "middle"; ctx.textAlign = "left"; ctx.fillText(label, bx + pad + 11, ty + 15);
      ty += 40;
    }
    ctx.font = `600 28px ${FONT}`; ctx.fillStyle = "#1a1026"; ctx.textAlign = "left"; ctx.textBaseline = "top";
    lines.forEach((l, i) => ctx.fillText(l, bx + pad, ty + i * lh + 2));
    ctx.restore();
  }

  function bigCaption(text, age) {
    const s = Math.min(1, age / 350), e = s < 1 ? 1 - Math.pow(1 - s, 3) * Math.cos(s * 6) : 1;
    ctx.save();
    ctx.font = `700 54px ${DISPLAY}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const w = ctx.measureText(text).width + 60;
    // sits between the two characters, shrunk to fit the gap
    const fit = Math.min(1, 420 / w);
    ctx.translate(W / 2, 470); ctx.scale(fit * (0.6 + 0.4 * e), fit * (0.6 + 0.4 * e)); ctx.globalAlpha = Math.min(1, s * 2);
    ctx.fillStyle = "rgba(18,8,34,.78)"; rr(-w / 2, -42, w, 84, 18); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = "#ff4fa3"; ctx.stroke();
    ctx.shadowColor = "#ff4fa3"; ctx.shadowBlur = 20; ctx.fillStyle = "#ffe27a"; ctx.fillText(text, 0, 2);
    ctx.restore();
  }

  function hud(s) {
    ctx.save();
    ctx.font = `700 24px ${DISPLAY}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(18,8,34,.6)"; rr(20, 20, 64, 40, 10); ctx.fill();
    ctx.fillStyle = "#ff4fa3"; ctx.fillText(s.badge || "▶", 36, 27);
    ctx.font = `800 20px ${FONT}`; ctx.fillStyle = "#fff";
    if (s.clip) ctx.fillText(`${s.labels.clip} ${s.clipIdx + 1}/${s.clipCount} · ${s.clip.title}`, 96, 30);
    ctx.fillStyle = "rgba(255,255,255,.15)"; ctx.fillRect(0, H - 6, W, 6);
    ctx.fillStyle = "#ffb347"; ctx.fillRect(0, H - 6, W * s.progress, 6);
    ctx.restore();
  }

  function titleCard(s) {
    ctx.save();
    ctx.fillStyle = "rgba(12,6,24,.55)"; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `700 30px ${DISPLAY}`; ctx.fillStyle = "#ffb347";
    ctx.fillText(s.finished ? s.labels.end : `${s.labels.clip.toUpperCase()} ${s.clipIdx + 1}`, W / 2, 250);
    ctx.font = `900 64px ${FONT}`; ctx.fillStyle = "#fff"; ctx.shadowColor = "#ff4fa3"; ctx.shadowBlur = 24;
    const lines = wrap(s.clip ? s.clip.title : "", 1100);
    lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, W / 2, 330 + i * 72 - (lines.length > 1 ? 36 : 0)));
    ctx.shadowBlur = 0; ctx.font = `600 24px ${FONT}`; ctx.fillStyle = "#d9ccf2";
    if (s.hint) ctx.fillText(s.hint, W / 2, 430);
    ctx.restore();
  }

  /**
   * Draws one frame.
   * s = { t, theme, characters, cast, clip, clipIdx, clipCount, line, lineAge,
   *       playing, finished, showTitle, progress, lang, labels, hint, badge }
   */
  function draw(context, s) {
    ctx = context;
    (BACKGROUNDS[s.theme] || sunset)(s.t);
    const line = s.line;
    [0, 1].forEach((slot) => {
      const ch = s.characters[slot] || DEFAULT_CHARACTERS[slot];
      const active = !!line && line.who === slot && !s.finished;
      person(ch, slot, s.cast[slot] || "", s.t, active && s.playing, active);
    });
    if (line && !s.finished) {
      bubble(line, s.lineAge, s.lang);
      if (line.big) bigCaption(line.big, s.lineAge);
    }
    hud(s);
    if (s.showTitle && s.clip) titleCard(s);
  }

  root.ExplainerScene = { draw, W, H, DEFAULT_CHARACTERS, TAGS, TAG_COLORS };
})(window);
