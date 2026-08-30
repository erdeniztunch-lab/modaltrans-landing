/* WCAG contrast over the demo's token layer, in both themes.
   Tokens alias each other (--text: var(--gray-900)), so the chain is resolved
   before any colour maths happens. */
const fs = require("fs");
const P = require("path").join(__dirname, "..", "fleet-management-demo.html");
const css = fs.readFileSync(P, "utf8").replace(/@font-face\{[\s\S]*?\}/, "").match(/<style>([\s\S]*?)<\/style>/)[1];

/* --- colour ------------------------------------------------------------- */
const srgb = v => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055);
function oklchToRgb(L, C, H) {
  const h = (H * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [
    srgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    srgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    srgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  ].map(v => Math.max(0, Math.min(1, v)));
}
const lum = ([r, g, b]) => {
  const c = v => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

/* --- token tables ------------------------------------------------------- */
function block(start, end) {
  const i = css.indexOf(start);
  const j = end ? css.indexOf(end, i) : css.length;
  return css.slice(i, j);
}
function readTokens(text) {
  const out = {};
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(text))) out[m[1]] = m[2].trim();
  return out;
}
const base = readTokens(block(":root {", "/* Density"));
const dark = { ...base, ...readTokens(block('[data-theme="dark"] {', "/* Same roles when")) };

function resolve(tokens, name, depth = 0) {
  if (depth > 12) return null;
  let v = tokens[name];
  if (!v) return null;
  const alias = v.match(/^var\((--[a-z0-9-]+)\)$/);
  if (alias) return resolve(tokens, alias[1], depth + 1);
  const m = v.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  return m ? oklchToRgb(+m[1], +m[2], +m[3]) : null;
}
/* the hero sits on a fixed gradient; its lightest stop is the hard case */
function heroLightestStop(tokens) {
  const g = tokens["--gradient-hero"] || "";
  const stops = [...g.matchAll(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/g)]
    .map(m => ({ L: +m[1], rgb: oklchToRgb(+m[1], +m[2], +m[3]) }));
  return stops.sort((a, b) => b.L - a.L)[0]?.rgb || null;
}
/* --on-hero is a plain alpha white; over the gradient it is effectively white */
const WHITE = [1, 1, 1];

const PAIRS = [
  ["--text", "--surface", 4.5], ["--text", "--bg", 4.5],
  ["--text-2", "--surface", 4.5], ["--text-muted", "--surface", 4.5],
  ["--text-muted", "--surface-2", 4.5],
  ["--accent", "--surface", 3], ["--accent-strong", "--surface", 4.5], ["--on-accent", "--accent-strong", 4.5],
  ["--ok-fg", "--ok-bg", 4.5], ["--warn-fg", "--warn-bg", 4.5],
  ["--bad-fg", "--bad-bg", 4.5], ["--info-fg", "--info-bg", 4.5],
  ["--neutral-fg", "--neutral-bg", 4.5],
  ["--control-border", "--surface", 3], ["--border-strong", "--surface", 1.2], ["--border", "--surface", 1.2],
  ["--on-surface-inverse", "--surface-inverse", 4.5],
];

let fails = 0, checks = 0;
[["LIGHT", base], ["DARK", dark]].forEach(([name, tokens]) => {
  console.log("\n" + name);
  PAIRS.forEach(([fg, bg, min]) => {
    const F = resolve(tokens, fg), B = resolve(tokens, bg);
    if (!F || !B) { console.log(`  ${fg.padEnd(21)} / ${bg.padEnd(19)}  unresolved`); return; }
    const r = ratio(F, B);
    checks++;
    const pass = r >= min;
    if (!pass) fails++;
    console.log(`  ${fg.padEnd(21)} / ${bg.padEnd(19)} ${r.toFixed(2).padStart(6)}  need ${min}  ${pass ? "OK" : "LOW"}`);
  });
  const hero = heroLightestStop(tokens);
  if (hero) {
    const r = ratio(WHITE, hero);
    checks++;
    const pass = r >= 4.5;
    if (!pass) fails++;
    console.log(`  ${"--on-hero (white)".padEnd(21)} / ${"hero lightest".padEnd(19)} ${r.toFixed(2).padStart(6)}  need 4.5  ${pass ? "OK" : "LOW"}`);
  }
});

console.log(`\n${checks - fails}/${checks} pass · ${fails} below threshold`);
process.exitCode = fails ? 1 : 0;
