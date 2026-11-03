/* Interface strings in Greek and English. Script content is not translated. */
(function (root) {
  "use strict";

  const STRINGS = {
    el: {
      tagline: "Γράψε ένα σενάριο. Δύο ανθρωπάκια το λένε σε κλιπ.",
      play: "▶ Παίξε", pause: "❚❚ Παύση", resume: "▶ Συνέχεια", nextClip: "▶ Επόμενο κλιπ", again: "↺ Ξανά από το 1ο",
      restart: "↺ Από την αρχή", prev: "⏮ Προηγ.", next: "Επόμ. ⏭",
      soundOn: "🔊 Φωνή", soundOff: "🔇 Χωρίς φωνή",
      speed: "Ταχύτητα", theme: "Σκηνικό", themeSunset: "Ηλιοβασίλεμα", themeNight: "Νύχτα στην πόλη", themeStudio: "Στούντιο",
      autoNext: "Συνεχόμενα κλιπ", fullscreen: "⛶ Πλήρης οθόνη",
      transcript: "Κείμενο κλιπ", transcriptHint: "Πάτα μια ατάκα για να πας εκεί.",
      tabScript: "Σενάριο", tabCast: "Χαρακτήρες", tabExport: "Εξαγωγή", tabHelp: "Βοήθεια",
      preset: "Παράδειγμα", loadPreset: "Φόρτωσε", scriptLabel: "Το σενάριό σου",
      scriptHint: "Μορφή: «Όνομα [ok]: κείμενο {μεγάλη λεζάντα}». Το # ξεκινά νέο κλιπ. Δες την Βοήθεια.",
      errors: "Προβλήματα στο σενάριο", noErrors: "Το σενάριο είναι εντάξει.", lineN: "Γραμμή",
      statsClips: "κλιπ", statsLines: "ατάκες",
      character: "Χαρακτήρας", left: "αριστερά", right: "δεξιά",
      shirt: "Μπλούζα", pattern: "Σχέδιο", skin: "Δέρμα", hair: "Μαλλιά", hairStyle: "Χτένισμα",
      hairShort: "Κοντά", hairLong: "Μακριά", hairBun: "Κότσος", hairCurly: "Σγουρά",
      accessory: "Αξεσουάρ", accNone: "Κανένα", accSunglasses: "Γυαλιά ηλίου", accGlasses: "Γυαλιά", accEarrings: "Σκουλαρίκια", accCap: "Καπέλο",
      pitch: "Τόνος φωνής", voice: "Φωνή", voiceAuto: "Αυτόματη",
      resetCast: "Επαναφορά χαρακτήρων",
      exportVideoTitle: "Βίντεο", recordVideo: "● Γράψε το κλιπ σε βίντεο", stopRecording: "■ Σταμάτα την εγγραφή",
      recording: "Γράφεται βίντεο… Μην αλλάξεις καρτέλα.", videoReady: "Το βίντεο είναι έτοιμο.", downloadVideo: "⤓ Κατέβασε το βίντεο",
      recUnsupported: "Ο browser σου δεν υποστηρίζει εγγραφή βίντεο. Δοκίμασε Chrome, Edge ή Firefox.",
      exportVideoNote: "Το βίντεο γράφεται χωρίς ήχο, γιατί ο browser δεν επιτρέπει εγγραφή της φωνής. Βάλε δίπλα τους υπότιτλους .srt.",
      subsTitle: "Υπότιτλοι", downloadSrt: "⤓ Κατέβασε .srt", copySrt: "Αντιγραφή", copied: "Αντιγράφηκε.", copyFailed: "Επίλεξε το κείμενο και αντέγραψέ το.",
      projectTitle: "Project", exportJson: "⤓ Αποθήκευση project (.json)", importJson: "Άνοιγμα project", imported: "Το project φορτώθηκε.", importFailed: "Αυτό το αρχείο δεν είναι project του Explainer Duo.",
      downloadNote: "Αν δεν κατεβαίνει τίποτα, άνοιξε τη σελίδα από το GitHub Pages ή τοπικά: εδώ ο browser μπλοκάρει τις λήψεις.",
      statusIdle: "Πάτα «Παίξε» ή το Space.", statusPlaying: "Παίζει: {title}", statusPaused: "Σε παύση.", statusEnd: "Τέλος κλιπ {n}/{total}.",
      noVoice: "Δεν βρέθηκε φωνή για τη γλώσσα «{lang}». Το κλιπ παίζει με συννεφάκια.",
      clip: "Κλιπ", end: "ΤΕΛΟΣ ΚΛΙΠ", pressPlay: "Πάτα ▶ για να ξεκινήσει", pressNext: "Πάτα ▶ για το επόμενο",
      saved: "Αποθηκεύτηκε σε αυτόν τον browser.",
      legendOk: "Επιβεβαιωμένο", legendRep: "Αναφορά Τύπου", legendUnc: "Ανεπιβεβαίωτο"
    },
    en: {
      tagline: "Write a script. Two characters act it out as clips.",
      play: "▶ Play", pause: "❚❚ Pause", resume: "▶ Resume", nextClip: "▶ Next clip", again: "↺ Start over",
      restart: "↺ Restart", prev: "⏮ Prev", next: "Next ⏭",
      soundOn: "🔊 Voice", soundOff: "🔇 Muted",
      speed: "Speed", theme: "Scene", themeSunset: "Sunset", themeNight: "City night", themeStudio: "Studio",
      autoNext: "Play clips in a row", fullscreen: "⛶ Fullscreen",
      transcript: "Clip transcript", transcriptHint: "Click a line to jump to it.",
      tabScript: "Script", tabCast: "Characters", tabExport: "Export", tabHelp: "Help",
      preset: "Example", loadPreset: "Load", scriptLabel: "Your script",
      scriptHint: "Format: “Name [ok]: text {big caption}”. # starts a new clip. See Help.",
      errors: "Script problems", noErrors: "The script looks good.", lineN: "Line",
      statsClips: "clips", statsLines: "lines",
      character: "Character", left: "left", right: "right",
      shirt: "Shirt", pattern: "Pattern", skin: "Skin", hair: "Hair", hairStyle: "Hairstyle",
      hairShort: "Short", hairLong: "Long", hairBun: "Bun", hairCurly: "Curly",
      accessory: "Accessory", accNone: "None", accSunglasses: "Sunglasses", accGlasses: "Glasses", accEarrings: "Earrings", accCap: "Cap",
      pitch: "Voice pitch", voice: "Voice", voiceAuto: "Automatic",
      resetCast: "Reset characters",
      exportVideoTitle: "Video", recordVideo: "● Record clip as video", stopRecording: "■ Stop recording",
      recording: "Recording… keep this tab open.", videoReady: "Your video is ready.", downloadVideo: "⤓ Download video",
      recUnsupported: "This browser can't record video. Try Chrome, Edge or Firefox.",
      exportVideoNote: "Videos are silent because browsers don't allow recording synthesized speech. Pair them with the .srt subtitles.",
      subsTitle: "Subtitles", downloadSrt: "⤓ Download .srt", copySrt: "Copy", copied: "Copied.", copyFailed: "Select the text and copy it.",
      projectTitle: "Project", exportJson: "⤓ Save project (.json)", importJson: "Open project", imported: "Project loaded.", importFailed: "That file isn't an Explainer Duo project.",
      downloadNote: "If nothing downloads, open the page from GitHub Pages or locally: this preview blocks downloads.",
      statusIdle: "Press Play or Space.", statusPlaying: "Playing: {title}", statusPaused: "Paused.", statusEnd: "End of clip {n}/{total}.",
      noVoice: "No voice found for language “{lang}”. The clip plays with speech bubbles only.",
      clip: "Clip", end: "END OF CLIP", pressPlay: "Press ▶ to start", pressNext: "Press ▶ for the next clip",
      saved: "Saved in this browser.",
      legendOk: "Confirmed", legendRep: "Reported", legendUnc: "Unconfirmed"
    }
  };

  let lang = "el";

  function t(key, vars) {
    let s = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    return s;
  }

  function apply(doc) {
    doc.documentElement.lang = lang;
    doc.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    doc.querySelectorAll("[data-lang]").forEach((el) => { el.hidden = el.dataset.lang !== lang; });
  }

  root.ExplainerI18n = {
    t, apply,
    get lang() { return lang; },
    set lang(v) { lang = STRINGS[v] ? v : "el"; }
  };
})(window);
