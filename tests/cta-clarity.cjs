/**
 * A control has to name the screen or the change it produces.
 * "Apply", "Submit", "Open" and friends leave the reader guessing, so they
 * fail here. Sequence controls inside the guided tour are the one exception:
 * Next and Replay mean exactly one thing in a numbered walkthrough.
 */
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "fleet-management-demo.html"), "utf8");

/* Labels the reader cannot predict from. */
const VAGUE = [
  "apply", "submit", "ok", "go", "continue", "open", "click here", "learn more",
  "read more", "start", "send", "save", "confirm", "yes", "no", "done", "close",
  "view", "details", "more", "select", "choose", "update", "change", "edit",
];
/* Controls whose meaning comes from their position in a sequence. */
const SEQUENCE_OK = new Set(["next", "replay", "back", "previous"]);

/* The inner content must not run past its own closing tag, or one control's
   icon swallows the next control's label. */
const controls = [];
for (const m of html.matchAll(/<(button|a)\b([^>]*)>((?:(?!<\/?(?:button|a)\b)[\s\S])*)<\/\1>/g)) {
  const attrs = m[2];
  if (m[1] === "a" && !/class="[^"]*\bbtn\b/.test(attrs)) continue;
  const text = m[3]
    .replace(/<svg[\s\S]*?<\/svg>/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\$\{[^}]*\}/g, "•")     // a template hole counts as content
    .replace(/\s+/g, " ")
    .trim();
  controls.push({ text, attrs });
}
const labels = controls.filter(c => c.text);

const ck = (label, ok, note) => {
  console.log("  " + (ok ? "OK  " : "FAIL") + "  " + label + (note ? "   " + note : ""));
  return ok;
};

let fails = 0;
console.log("\n== every control names its outcome ==");
const seen = new Set();
for (const { text, attrs } of labels) {
  const bare = text.toLowerCase().replace(/[.•]/g, "").trim();
  if (seen.has(bare)) continue;
  seen.add(bare);
  if (SEQUENCE_OK.has(bare)) { ck(`"${text}"`, true, "sequence control"); continue; }
  const vague = VAGUE.includes(bare);
  const tooShort = bare.length > 0 && bare.split(" ").length === 1 && !/•/.test(text) && bare.length < 5;
  const ok = !vague && !tooShort;
  if (!ok) fails++;
  ck(`"${text}"`, ok, vague ? "reads as a generic verb" : tooShort ? "too short to predict from" : "");
}

console.log("\n== icon-only controls still say what they do ==");
const iconOnly = controls.filter(c => !c.text);
console.log("  (" + iconOnly.length + " controls carry an icon and nothing else)");
iconOnly.forEach(({ attrs }) => {
  const id = (attrs.match(/id="([^"]+)"/) || attrs.match(/data-([a-z-]+)/) || [, "(inline)"])[1];
  const has = /aria-label/.test(attrs);
  if (!has) fails++;
  ck("icon-only " + id, has, has ? "" : "no aria-label — nobody can guess this one");
});

console.log("\n== the controls that carry the demo ==");
const must = [
  ["Assign a load", "the top-bar primary action goes to the queue"],
  ["Take the tour", "not “Play story”"],
  ["Show the ", "the hero says how many trucks it will show"],
  ["Move TR-4471 to", "Genie names the move, not “Apply”"],
  ["Not now", "and its opposite is plain"],
  ["Only expiring documents", "the filter says what it filters to"],
  ["Find a load for it", "from a truck, you go looking for work"],
  ["Clear selection", "not a bare “Clear”"],
  ["Close and keep exploring", "the last tour step says where you land"],
  ["Undo this assignment", "names what is undone"],
];
must.forEach(([needle, why]) => { if (!ck(`"${needle}"`, html.includes(needle), why)) fails++; });

console.log("\n== state-labelled buttons became real controls ==");
if (!ck("corridor is a select, not a cycling label", /<select data-corridor>/.test(html))) fails++;
if (!ck("no “Corridor: all” button left", !/Corridor: all/.test(html))) fails++;
if (!ck("doc filter reports pressed state", /data-filter="docs"[\s\S]{0,120}aria-pressed/.test(html))) fails++;

console.log("\n" + (fails ? fails + " FAIL" : "hepsi geçti"));
process.exitCode = fails ? 1 : 0;
