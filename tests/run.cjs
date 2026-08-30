/**
 * Runs every suite in this folder and reports one total.
 *
 * The demo has no build step and no framework, so the tests do not need a
 * runner either: each file evaluates the app's own data layer and view
 * functions against a small DOM stub, prints "OK" or "FAIL" per assertion,
 * and exits non-zero if anything failed.
 */
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const SUITES = [
  ["data-and-counts.cjs",    "fleet numbers are computed, not typed"],
  ["assign-flow.cjs",        "compliance gate, ranking, the ripple, undo"],
  ["vehicle-drawer.cjs",     "paperwork derives the summary; renewing ripples"],
  ["trips-and-drivers.cjs",  "trip buckets partition; AETR and tacho rules"],
  ["map-and-simulation.cjs", "corridor geometry, clustering, ticker isolation"],
  ["guided-tour.cjs",        "five steps, copy from data, clean rollback"],
  ["polish-and-a11y.cjs",    "sorting, skeletons, mobile cards, glossary"],
  ["cta-clarity.cjs",        "every control names the screen or change it makes"],
  ["audit.cjs",              "cross-cutting audit for data contradictions"],
  ["audit-full.cjs",         "whole-app sweep: stress, wiring, dead code"],
  ["contrast.cjs",           "WCAG contrast across both themes"],
];

let pass = 0, fail = 0, broken = 0;

for (const [file, blurb] of SUITES) {
  let out = "", code = 0;
  try {
    out = execFileSync(process.execPath, [path.join(__dirname, file)], { encoding: "utf8" });
  } catch (e) {
    out = (e.stdout || "") + (e.stderr || "");
    code = e.status ?? 1;
  }
  const ok = (out.match(/ OK$/gm) || []).length;
  const bad = (out.match(/FAIL/g) || []).length;
  const clean = /Bulgu yok|below threshold/.test(out) ? (out.match(/(\d+)\/(\d+) pass/) || [])[0] : "";
  pass += ok; fail += bad;
  if (code && !bad) broken++;

  const status = bad ? "FAIL" : code ? "ERROR" : "ok";
  console.log(
    `${status.padEnd(6)} ${file.padEnd(24)} ${String(ok || clean || "—").padStart(8)}  ${blurb}`
  );
  if (bad || (code && !bad)) console.log(out.split("\n").filter(l => /FAIL|HATA|Error/.test(l)).slice(0, 6).map(l => "       " + l.trim()).join("\n"));
}

console.log("\n" + "-".repeat(72));
console.log(`${pass} checks passed · ${fail} failed${broken ? ` · ${broken} suite(s) errored` : ""}`);
process.exit(fail || broken ? 1 : 0);
