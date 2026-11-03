# Vice City Talk

**Small talk for GTA 6.** Write a short dialogue script and two animated characters act it out as explainer clips, with speech, speech bubbles, fact-check tags and big captions. It ships with three clips about what Rockstar has confirmed for GTA 6, and works for any other topic too. Everything runs in the browser with plain HTML, CSS and JavaScript: no frameworks, no build step, no dependencies.

**Live demo:** https://pap35000.github.io/vice-city-talk/

> 🇬🇷 [Ελληνική περιγραφή παρακάτω](#ελληνικά)

<!-- Add a screenshot or GIF here, e.g. ![Vice City Talk](docs/screenshot.png) -->

## Features

- **Script language.** A small text format for clips, speakers, fact-check tags, big captions and live variables, parsed with line-numbered error messages.
- **Canvas 2D animation.** Hand-drawn characters with lip movement, blinking, gestures and idle motion, plus three animated scenes (sunset, city night, studio).
- **Text to speech.** Uses the Web Speech API with a separate voice and pitch per character, and falls back to timed speech bubbles when no voice exists for the language.
- **Character editor.** Shirt, pattern, skin and hair colours, four hairstyles, five accessories, voice and pitch.
- **Video export.** Records a clip to WebM with `MediaRecorder` and `canvas.captureStream()`.
- **Subtitles.** Generates `.srt` files that line up with the exported video.
- **Projects.** Save and open the script and characters as JSON. Work is also kept in `localStorage`.
- **Bilingual interface.** Greek and English.
- **Accessibility.** Keyboard shortcuts, an `aria-live` transcript, ARIA tabs, visible focus and `prefers-reduced-motion` support.
- **Tested.** The parser has unit tests on Node's built-in test runner, run on every push by GitHub Actions, which also deploys the site to GitHub Pages.

## Script format

```text
@lang el            // voice language: el, en, …
@theme sunset       // sunset | night | studio
@cast Τάκης, Λένα   // left and right character

# Clip title
> Short description shown on the clip card
Τάκης: A plain line.
Λένα [ok]: A line with a green "confirmed" tag. {BIG CAPTION}
Τάκης [rep]: Yellow "reported" tag. [unc] gives a red "unconfirmed" tag.
Λένα: {{days}} days until 19 Nov 2026.
```

Names match without accents or case. Tags also accept `confirmed`, `reported`, `rumor` and their Greek forms.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Space` / `K` | Play or pause |
| `←` `→` | Previous / next line |
| `1`–`9` | Pick a clip |
| `R` | Restart the clip |
| `M` | Voice on / off |
| `F` | Fullscreen |

## Project structure

```text
index.html            page markup
css/style.css         styles (design tokens at the top)
js/parser.js          script parser, durations and SRT export (browser + Node)
js/presets.js         example scripts
js/scene.js           canvas renderer: scenes, characters, bubbles, captions
js/player.js          playback engine and speech synthesis
js/recorder.js        video recording and file downloads
js/i18n.js            Greek / English interface strings
js/app.js             UI wiring, editor, settings, shortcuts, storage
tests/parser.test.js  unit tests
.github/workflows/    test and deploy to GitHub Pages
```

The parser has no DOM dependencies, so the same file runs in the browser and in the Node tests.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npm start
```

Run the tests (Node 22 or newer):

```bash
npm test
```

## Deploy to GitHub Pages

1. Push the repository to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Each push to `main` runs the tests and publishes the site.

## Known limits

- Browsers cannot record synthesized speech, so exported videos are silent. Use the `.srt` subtitles with them, or record your screen with sound.
- Available voices depend on the browser and operating system. Microsoft Edge usually offers the most languages, including Greek.

## Credits

The GTA 6 example paraphrases facts presented in [“GTA 6 in 5 Minutes: Everything Rockstar Actually Confirmed”](https://www.youtube.com/watch?v=F8pKy2S_ZvE) by No Cap 6. This project is not affiliated with Rockstar Games or Take-Two Interactive.

Built with help from Claude, an AI assistant by Anthropic.

## License

[MIT](LICENSE)

---

## Ελληνικά

Το **Vice City Talk** είναι κουβεντούλα για το GTA 6: ένα εργαλείο στον browser όπου γράφεις ένα σύντομο σενάριο διαλόγου και δύο κινούμενα ανθρωπάκια το λένε σε κλιπ, με φωνή, συννεφάκια, ετικέτες επιβεβαίωσης και μεγάλες λεζάντες.

- Δικό του απλό format σεναρίου, με μηνύματα λάθους ανά γραμμή.
- Κίνηση με Canvas 2D: στόμα που μιλάει, ανοιγοκλείσιμο ματιών, χειρονομίες, τρία σκηνικά.
- Φωνή μέσω Web Speech API, ξεχωριστή για κάθε χαρακτήρα.
- Εξαγωγή κλιπ σε βίντεο (WebM) και υπότιτλους (.srt).
- Αποθήκευση και άνοιγμα project σε JSON.
- Διεπαφή στα ελληνικά και αγγλικά, συντομεύσεις πληκτρολογίου, προσβασιμότητα.
- Unit tests και αυτόματο deploy στο GitHub Pages με GitHub Actions.

Τρέχει χωρίς εγκατάσταση: άνοιξε το `index.html`.
