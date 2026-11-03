/*
 * Video export with MediaRecorder on the canvas stream, plus file helpers.
 * Speech synthesis audio cannot be captured by the browser, so videos are
 * silent and meant to be paired with the exported .srt subtitles.
 */
(function (root) {
  "use strict";

  const TYPES = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"];

  function supported() {
    return typeof HTMLCanvasElement !== "undefined" &&
      !!HTMLCanvasElement.prototype.captureStream && typeof MediaRecorder !== "undefined";
  }

  function start(canvas, fps) {
    const stream = canvas.captureStream(fps || 30);
    const mimeType = TYPES.find((t) => MediaRecorder.isTypeSupported(t)) || "";
    const rec = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 6e6 } : {});
    const chunks = [];
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.start(250);
    return {
      ext: (rec.mimeType || mimeType).includes("mp4") ? "mp4" : "webm",
      stop() {
        return new Promise((resolve) => {
          rec.onstop = () => {
            stream.getTracks().forEach((t) => t.stop());
            resolve(new Blob(chunks, { type: rec.mimeType || "video/webm" }));
          };
          rec.stop();
        });
      }
    };
  }

  function download(filename, data, type) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: type || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return url;
  }

  function slug(s) {
    return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[^a-z0-9Ͱ-Ͽ]+/g, "-").replace(/^-+|-+$/g, "") || "clip";
  }

  root.ViceCityTalkRecorder = { supported, start, download, slug };
})(window);
