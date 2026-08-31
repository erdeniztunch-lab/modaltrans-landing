/**
 * The landing page may only describe things the demo actually does.
 *
 * Claims are not checked against memory: this file boots the demo's own data
 * layer and selectors, asks them for every figure the page quotes, and fails if
 * the two disagree. Change the fleet and this test tells you which sentence on
 * the landing page went stale.
 */
const fs = require("fs");
const path = require("path");

const LANDING = fs.readFileSync(path.join(__dirname, "..", "landing.html"), "utf8");
const DEMO = fs.readFileSync(path.join(__dirname, "..", "fleet-management-demo.html"), "utf8");
const KNOWLEDGE = fs.readFileSync(path.join(__dirname, "..", "modaltrans-knowledge.md"), "utf8");
const demoJs = DEMO.slice(DEMO.indexOf("<script>") + 8, DEMO.lastIndexOf("</script>"));
const css = LANDING.match(/<style>([\s\S]*?)<\/style>/)[1];

/* There is no "what this is not" section any more, so nothing on the page
   withdraws a claim later. The unbuilt list below is therefore checked against
   the whole file rather than against a prefix of it. */
const CLAIMS = LANDING;

let fails = 0;
const ck = (label, ok, note) => {
  if (!ok) fails++;
  console.log("  " + (ok ? "OK  " : "FAIL") + "  " + label + (note ? "   " + note : ""));
  return ok;
};
/* The page has to contain the string the app produces, character for character. */
const says = (label, text) => ck(label, LANDING.includes(text), LANDING.includes(text) ? "" : "missing: " + text);

/* ---------------------------------------------------------------------------
   Boot the demo so the numbers can be asked for rather than remembered.
   ------------------------------------------------------------------------ */
const core = demoJs.slice(0, demoJs.lastIndexOf("/* ====", demoJs.indexOf("   EVENTS — one delegated")));
global.addEventListener = () => {};
global.location = { hash: "" };
global.matchMedia = () => ({ matches: false });
global.localStorage = { getItem: () => null, setItem() {} };
const stubEl = { innerHTML: "", textContent: "", dataset: {}, setAttribute() {}, focus() {}, append() {}, querySelector: () => null, closest: () => null };
global.document = { getElementById: () => stubEl, querySelector: () => null, addEventListener() {}, documentElement: { dataset: {} }, body: { style: {} }, activeElement: { tagName: "BODY", dataset: {} }, createElement: () => ({ style: {}, onclick: null, append() {}, remove() {} }), title: "" };
global.window = { scrollTo() {}, scrollY: 0 };

const app = new Function(core + "\nreturn { S, A, chainFor, hm, nfmt };")();
const { S, A, chainFor, hm, nfmt } = app;

const STORY_LEG = "TR-4482";   /* the load the panel assigns */
const ROLLING = "TR-4471";     /* the trip the corridor section shows */

console.log("\n== it does not claim what was never built ==");
/* Each may appear once the page is explicitly listing what is absent. */
const UNBUILT = [
  "route optimis", "route optimiz", "driver behaviour", "driver scoring",
  "subcontractor portal", "self-service portal", "mobile app",
  "artificial intelligence", "machine learning",
  "freight rate", "tariff compar", "carbon report",
];
UNBUILT.forEach(term =>
  ck(`"${term}" appears nowhere`, !CLAIMS.toLowerCase().includes(term.toLowerCase())));
/* short acronyms need a word boundary, or "available" reads as "AI" */
[["AI", /\bAI\b/], ["ML", /\bML\b/], ["TMS", /\bTMS\b/]].forEach(([term, re]) =>
  ck(`"${term}" appears nowhere`, !re.test(CLAIMS)));

/* With the honest-limits section gone, three short lines carry the whole
   disclosure. If any of them is edited away, the page starts reading as a
   shipped Modaltrans module. */
ck("the header calls it a concept build", /class="chip">Concept build</.test(LANDING));
ck("the footer repeats it, and says nothing is stored",
  /Concept build · figures from a 42 vehicle demo fleet · nothing is saved or sent/.test(LANDING));
ck("it is never called a launch", !/early launch|now available|generally available/i.test(LANDING));

console.log("\n== the seven checks ==");
const checkNames = [...new Set([...demoJs.matchAll(/push\("(?:ok|warn|bad)", "([^"]+)"/g)].map(m => m[1]))];
ck("seven check names exist in the app", checkNames.length === 7, checkNames.length + " found");
checkNames.forEach(n => says("  page names " + n, ">" + n + "<"));
ck("the page says the gate holds seven", /gate holds seven checks/i.test(LANDING));

/* No single assignment can show all seven: Driver and Driver hours exclude
   each other. The page must show the six that really run on its leg. */
let maxRows = 0;
S.trips().forEach(t => S.all().forEach(v => {
  maxRows = Math.max(maxRows, S.compliance(v, S.driverFor(v), t).length);
}));
ck("no assignment shows more than six at once", maxRows === 6, maxRows + " max");
const firstPanel = LANDING.slice(LANDING.indexOf('class="panel"'), LANDING.indexOf('class="gate"'));
ck("the first panel shows exactly six rows",
  (firstPanel.match(/class="checkcell[ "]/g) || []).length === 6);
ck("the page explains why Driver is not on the leg", /Driver appears only when the truck has none/.test(LANDING));

console.log("\n== the panel quotes the app, character for character ==");
const trip = S.tripByRef(STORY_LEG);
const veh = S.all().find(v => v.plate === "34 TR 5510");
const drv = S.driverFor(veh);
ck("the story leg is still unassigned", trip.status === "unassigned", trip.status);
ck("the story leg still carries dangerous goods", trip.adr === true);
says("plate", "34 TR 5510");
says("vehicle model", veh.model.split(" · ")[0]);
says("leg route", trip.origin + " to " + trip.destination);
says("leg reference", STORY_LEG);

const before = S.compliance(veh, drv, trip);
ck("exactly one check fails before the fix",
  before.filter(c => c.level === "bad").length === 1);
before.forEach(c => says("  row: " + c.name, c.why));

const dh = before.find(c => c.name === "Driver hours");
says("the offered fix", dh.fix + ".");
says("the fix button", dh.act.label);

const alt = S.drivers().find(d => d.id === dh.act.driverId);
const after = S.compliance(veh, alt, trip);
ck("nothing fails after the swap", after.filter(c => c.level === "bad").length === 0);
says("the cleared driver-hours row", after.find(c => c.name === "Driver hours").why);
says("the driver who keeps his rest window", drv.name);

const rank = S.rankVehiclesForLeg(STORY_LEG);
const scored = rank.find(r => r.vehicle.plate === "34 TR 5510");
says("readiness before", ">" + scored.score + "<span");
ck("readiness after is a clean hundred", LANDING.includes(">100<span"));
ck("the short driver really is 5h 35m short",
  hm(trip.legMin - drv.minutesLeft) === "5h 35m" && LANDING.includes("5h 35m"));

console.log("\n== the six records of one confirmation ==");
const cost = A.estimateCost(veh, trip);
says("estimated cost", "€" + nfmt(cost.total));
says("CO2e", nfmt(A.estimateCo2(trip)) + " kg CO₂e");
/* The six records are shown once, in the confirmed panel. They used to be
   repeated as a section of their own, which said nothing new. */
ck("six records are drawn", (LANDING.match(/class="rec"/g) || []).length === 6);
ck("they are drawn once, not twice", (LANDING.match(/Available becomes On trip/g) || []).length === 1);
ck("undo is offered, because the app has undo",
  /can be undone/.test(LANDING) && /every one of\s+them can be undone/.test(LANDING) &&
  /Store\.undo|undo\(\)/.test(demoJs));

console.log("\n== the morning list matches the app's own signals ==");
const attention = S.attention();
ck("the page shows every signal the app has",
  (LANDING.match(/class="arow"/g) || []).length === attention.length,
  attention.length + " in the app");
attention.forEach(a => {
  says("  " + a.title, ">" + a.title + "<");
  says("    " + a.sub, ">" + a.sub + "<");
  says("    count " + a.count, ">" + a.count + "</span>");
});
ck("vehicles needing attention agrees with the app",
  S.needAttention() === 7 && /Seven vehicles carry a blocking signal/.test(LANDING),
  S.needAttention() + " in the app");

console.log("\n== the corridor chain matches chainFor() ==");
const chain = chainFor(S.tripByRef(ROLLING));
ck("six links are drawn", (LANDING.match(/class="node[ "]/g) || []).length === 6);
chain.forEach(([name, state, , meta]) => {
  says("  link " + name, ">" + name + "<");
  says("    " + meta, ">" + meta + "<");
});
const blockedLink = chain.find(c => c[1] === "blocked");
ck("one link is blocked, and it is GVMS", !!blockedLink && blockedLink[0] === "GVMS",
  blockedLink ? blockedLink[0] : "none blocked");
const decls = S.tripByRef(ROLLING).declarations;
["uetds", "ncts", "ens", "gvms"].forEach(k =>
  ck("  declaration " + k + " is tracked", k in decls, decls[k]));
["U-ETDS", "NCTS", "ENS", "GVMS"].forEach(d => says("  page names " + d, ">" + d + "<"));
ck("the ferry really is Calais to Dover",
  /"TR → UK":[\s\S]{0,220}?sea:\s*\[\["Calais",\s*"Dover"\]\]/.test(demoJs) && /Calais/.test(LANDING));

console.log("\n== own and subcontracted go through one gate ==");
says("own count", S.scopeCount("own") + " own");
says("subcontracted count", S.scopeCount("subcontracted") + " subcontracted");
ck("the gate does not distinguish them",
  /no difference between them/.test(LANDING) &&
  !/ownership/i.test(demoJs.match(/compliance\(v, d, trip\) \{[\s\S]*?return out;/)[0]));

console.log("\n== the page is short enough to be read ==");
/* Four screens: the gate, the same gate cleared, the morning list, the
   corridor. Nothing that repeats what another one already showed. */
const sections = (LANDING.match(/^  <section/gm) || []).length;
ck("four sections", sections === 4, sections + " found");
const h2s = (LANDING.match(/<h2>/g) || []).length;
ck("one h1 and three h2s", h2s === 3, h2s + " found");
ck("no numbered chapters", !/(One|Two|Three|Four) · /.test(LANDING));
/* Prose is allowed; walls of it are not. */
const paras = [...LANDING.matchAll(/<p class="(?:sub|lead|gate)"[^>]*>([\s\S]*?)<\/p>/g)]
  .map(m => m[1]
    .replace(/<span class="gatename">[\s\S]*?<\/span>/g, "")  /* chips are furniture, not prose */
    .replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim());
const longest = paras.reduce((a, b) => (b.length > a.length ? b : a), "");
ck("no paragraph runs past 220 characters", longest.length <= 220,
  longest.length + " chars: " + longest.slice(0, 48) + "…");

console.log("\n== headline figures ==");
says("fleet size", ">42<");
says("utilisation", S.utilisation() + "%");
says("documents expiring", ">" + S.docsExpiring() + "<");

console.log("\n== controls name what they open ==");
const VAGUE = ["get started", "learn more", "sign up", "try it", "submit", "apply", "continue", "go", "click here"];
const ctas = [...LANDING.matchAll(/<a\b[^>]*class="[^"]*\bbtn\b[^"]*"[^>]*>([\s\S]*?)<\/a>/g)]
  .map(m => m[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim());
/* One in the hero, one at the end of the scroll, both opening the same thing.
   The closing one is a strip, not a section, so it does not read as a chapter. */
ck("two calls to action, no more", ctas.length === 2, ctas.length + " found");
ck("the last one is a strip, not a section",
  /class="last"/.test(LANDING) && (LANDING.match(/^  <section/gm) || []).length === 4);
const header = LANDING.slice(LANDING.indexOf("<header"), LANDING.indexOf("</header>"));
ck("the header carries none of its own", !/class="[^"]*\bbtn\b/.test(header));
ctas.forEach(t => ck(`"${t}"`, !VAGUE.includes(t.toLowerCase())));
ck("every demo link is marked for the build rewrite",
  (LANDING.match(/claude\.ai\/code\/artifact/g) || []).length ===
  (LANDING.match(/data-demo-link/g) || []).length);

/* The two pages have to point at each other, and both hrefs have to survive
   being rewritten for the web build. */
ck("the demo has a way back to this page", (DEMO.match(/data-landing-link/g) || []).length === 1);
ck("its label says where it goes", /Back to the module page/.test(DEMO));
ck("every artifact URL in the demo is marked for rewriting",
  (DEMO.match(/claude\.ai\/code\/artifact/g) || []).length ===
  (DEMO.match(/data-landing-link/g) || []).length);
const build = fs.readFileSync(path.join(__dirname, "..", "scripts", "build.mjs"), "utf8");
["data-demo-link", "data-landing-link"].forEach(attr =>
  ck("  the build rewrites " + attr, build.includes(attr)));

console.log("\n== structure and access ==");
ck("exactly one h1", (LANDING.match(/<h1[\s>]/g) || []).length === 1);
ck("no heading level skipped", !/<h3[\s>]/.test(LANDING) || /<h2[\s>]/.test(LANDING));
ck("no external request", !/https?:\/\/(?!claude\.ai)/.test(LANDING.replace(/<!--[\s\S]*?-->/g, "")));
ck("focus is visible", /:focus-visible/.test(css));
ck("decorative marks are hidden from screen readers",
  (LANDING.match(/<svg(?![^>]*aria-hidden)/g) || []).length === 0);
ck("the font placeholder survives for the build", LANDING.includes("/*__FONT__*/"));

console.log("\n== the page holds still ==");
/* The design dropped the animation on purpose: two fixed states, prose between
   them. Nothing here should move, so nothing needs a reduced-motion escape. */
ck("no keyframes", !/@keyframes/.test(css));
ck("no transition or animation property", !/\b(animation|transition)\s*:/.test(css));
ck("no script of its own", !/<script/.test(LANDING));

console.log("\n== contrast ==");
const srgb = v => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055);
const toRgb = (L, C, H) => {
  const h = (H * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [srgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
          srgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
          srgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)].map(v => Math.max(0, Math.min(1, v)));
};
const lum = ([r, g, b]) => { const c = v => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const read = text => { const o = {}; let m; const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/g;
  while ((m = re.exec(text))) o[m[1]] = m[2].trim(); return o; };
const slice = (from, to) => css.slice(css.indexOf(from), to ? css.indexOf(to, css.indexOf(from)) : undefined);
const base = read(slice(":root {", "*, *::before"));
const resolve = (t, k, d = 0) => { if (d > 10) return null; const v = t[k]; if (!v) return null;
  const a = v.match(/^var\((--[a-z0-9-]+)\)$/); if (a) return resolve(t, a[1], d + 1);
  const m = v.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/); return m ? toRgb(+m[1], +m[2], +m[3]) : null; };

/* The page is deliberately single-theme, so there must be no second palette
   hiding behind a media query that the loop above would never measure. */
ck("one palette only, no dark override", !/prefers-color-scheme/.test(css));
ck("the scheme is declared, so the host does not paint under it",
  /color-scheme:\s*light/.test(css));

const PAIRS = [
  ["--text", "--bg", 4.5], ["--text-2", "--bg", 4.5], ["--text-muted", "--bg", 4.5],
  ["--text-muted", "--bg-2", 4.5], ["--accent-strong", "--bg", 4.5],
  ["--on-accent", "--accent-strong", 4.5], ["--line-strong", "--bg", 3],
  ["--on-ink", "--ink-panel", 4.5], ["--on-ink-muted", "--ink-panel", 4.5],
  ["--ok-fg", "--bg", 4.5], ["--bad-fg", "--bg", 4.5], ["--warn-fg", "--bg", 4.5], ["--info-fg", "--bg", 4.5],
  ["--ink-ok-fg", "--ink-panel", 4.5], ["--ink-bad-fg", "--ink-panel", 4.5],
  ["--ink-node-blocked-fg", "--ink-node-blocked-bg", 4.5],
];
PAIRS.forEach(([fg, bg, min]) => {
  const F = resolve(base, fg), B = resolve(base, bg);
  if (!F || !B) return ck(`  ${fg} / ${bg}`, false, "unresolved");
  const r = ratio(F, B);
  ck(`  ${fg} / ${bg}`, r >= min, r.toFixed(2) + " need " + min);
});

console.log("\n" + (fails ? fails + " FAIL" : "hepsi geçti"));
process.exitCode = fails ? 1 : 0;
