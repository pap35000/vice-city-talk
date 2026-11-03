const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../js/parser.js");
const PRESETS = require("../js/presets.js");

test("parses directives, clips and lines", () => {
  const r = P.parseScript([
    "@lang en",
    "@theme night",
    "@cast Tom, Lena",
    "# First",
    "> About the first clip",
    "Tom: Hello there.",
    "Lena [ok]: It is confirmed. {BIG NEWS}"
  ].join("\n"));
  assert.deepEqual(r.errors, []);
  assert.equal(r.meta.lang, "en");
  assert.equal(r.meta.theme, "night");
  assert.deepEqual(r.cast, ["Tom", "Lena"]);
  assert.equal(r.clips.length, 1);
  assert.equal(r.clips[0].title, "First");
  assert.equal(r.clips[0].points, "About the first clip");
  assert.deepEqual(r.clips[0].lines[1], { who: 1, tag: "ok", text: "It is confirmed.", big: "BIG NEWS", src: 7 });
});

test("builds the cast from the first two speakers when @cast is missing", () => {
  const r = P.parseScript("A: one\nB: two\nA: three");
  assert.deepEqual(r.cast, ["A", "B"]);
  assert.deepEqual(r.clips[0].lines.map((l) => l.who), [0, 1, 0]);
});

test("matches names without accents or case", () => {
  const r = P.parseScript("@cast Τάκης, Λένα\nτακης: γεια\nΛΕΝΑ: γεια σου");
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.clips[0].lines.map((l) => l.who), [0, 1]);
});

test("accepts Greek and English tag aliases", () => {
  const r = P.parseScript("A [confirmed]: x\nB [φήμη]: y\nA [Αναφορά]: z");
  assert.deepEqual(r.clips[0].lines.map((l) => l.tag), ["ok", "unc", "rep"]);
});

test("replaces {{vars}} before reading big captions", () => {
  const r = P.parseScript("A: {{days}} days left {in {{days}} days}", { vars: { days: 16 } });
  assert.equal(r.clips[0].lines[0].text, "16 days left");
  assert.equal(r.clips[0].lines[0].big, "in 16 days");
});

test("reports errors with line numbers", () => {
  const r = P.parseScript("@cast A, B\nC: who am I\nA [nope]: x\n@theme moon\n@wat 1\nno colon here\nB:");
  assert.deepEqual(r.errors.map((e) => e.line), [2, 3, 4, 5, 6, 7]);
});

test("a third speaker is an error", () => {
  const r = P.parseScript("A: 1\nB: 2\nC: 3");
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0].msg, /Unknown character/);
});

test("ignores comments and drops empty clips", () => {
  const r = P.parseScript("// note\n# Empty\n# Full\nA: hi");
  assert.equal(r.clips.length, 1);
  assert.equal(r.clips[0].title, "Full");
});

test("an empty script explains what is missing", () => {
  const r = P.parseScript("");
  assert.equal(r.clips.length, 0);
  assert.equal(r.errors.length, 1);
});

test("durations scale with speed and have a floor", () => {
  assert.equal(P.estimateDuration("hi"), 2200);
  assert.equal(P.estimateDuration("x".repeat(100)), 6200);
  assert.equal(P.estimateDuration("x".repeat(100), 2), 3100);
});

test("formats SRT timestamps", () => {
  assert.equal(P.srtTime(0), "00:00:00,000");
  assert.equal(P.srtTime(3723456), "01:02:03,456");
});

test("builds SRT blocks with speaker names and offset", () => {
  const r = P.parseScript("A: hi\nB: there");
  const srt = P.toSRT(r.clips[0], r.cast, { offsetMs: 1000 });
  assert.equal(srt, "1\n00:00:01,000 --> 00:00:03,200\nA: hi\n\n2\n00:00:03,650 --> 00:00:05,850\nB: there\n");
});

test("every bundled example parses without errors", () => {
  for (const p of PRESETS) {
    const r = P.parseScript(p.script, { vars: { days: 10 } });
    assert.deepEqual(r.errors, [], p.id);
    assert.ok(r.clips.length >= 2, p.id);
    assert.ok(!JSON.stringify(r.clips).includes("{{"), p.id + " has an unreplaced variable");
  }
});
