const fs = require("fs");
const P = require("path").join(__dirname, "..", "fleet-management-demo.html");
const raw = fs.readFileSync(P, "utf8");
const html = raw.replace(/@font-face\{[\s\S]*?\}/, "");
const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const js = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
const core = js.slice(0, js.lastIndexOf("/* ====", js.indexOf("   EVENTS — one delegated")));

const els = {};
const node = () => ({ innerHTML: "", textContent: "", dataset: {}, hidden: true, style: {},
  setAttribute() {}, focus() {}, append() {}, remove() {}, querySelector: () => null,
  querySelectorAll: () => [], getBoundingClientRect: () => ({ left: 0, top: 0, width: 10, height: 10, bottom: 10, right: 10 }),
  scrollIntoView() {}, contains: () => false, click() {} });
global.addEventListener = () => {};
global.location = { hash: "" };
global.matchMedia = () => ({ matches: false });
global.localStorage = { getItem: () => null, setItem() {} };
global.setInterval = () => 1; global.clearInterval = () => {}; global.setTimeout = () => 1; global.clearTimeout = () => {};
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = () => {};
global.innerHeight = 900; global.innerWidth = 1440;
global.document = { getElementById: id => (els[id] || (els[id] = node())), querySelector: () => null,
  querySelectorAll: () => [], addEventListener() {}, documentElement: { dataset: {} }, body: { style: {} },
  activeElement: { tagName: "BODY", dataset: {} }, createElement: () => node(), title: "" };
global.window = { scrollTo() {}, scrollY: 0 };

const found = [];
const ck = (l, v, e) => {
  const ok = e === undefined ? true : String(v) === String(e);
  if (!ok) found.push(l);
  console.log("  " + l.padEnd(46) + String(v).padStart(5) + "  " + (e === undefined ? "" : ok ? "OK" : "FAIL (expected " + e + ")"));
};

console.log("\n== a) sortable headers tell the truth ==");
ck("only sortable headers get the pointer", /table\.data th\[data-sort\] \{ cursor: pointer; \}/.test(css), "true");
ck("the blanket pointer is gone", /table\.data th \{[^}]*cursor: pointer/.test(css), "false");
ck("headers carry data-sort", /data-sort="\$\{k\}"/.test(js) || /data-sort=/.test(js), "true");
ck("aria-sort is set on the active one", /aria-sort=/.test(js), "true");
ck("a click handler exists", /hit\("\[data-sort\]"\)/.test(js), "true");
ck("Enter and Space work on a header", /th\[data-sort\][\s\S]{0,120}Enter/.test(js), "true");

console.log("\n== b) the loading skeleton is wired ==");
ck(".skel is used, not just defined", /class="skel"/.test(js), "true");
ck("a slow path exists", /uiSlow\(patch\)/.test(js), "true");
ck("tab changes use it", /Store\.uiSlow\(\{ tab:/.test(js), "true");
ck("scope changes use it", /Store\.uiSlow\(\{ scope:/.test(js), "true");
ck("typing does NOT use it", /role === "search"[\s\S]{0,80}uiSlow/.test(js), "false");

console.log("\n== c) the table survives 390px ==");
ck("rows become blocks", /table\.data tr \{[\s\S]{0,120}display: block/.test(css) || /table\.data, table\.data tbody, table\.data tr, table\.data td \{ display: block/.test(css), "true");
ck("headers are hidden from sight", /table\.data thead \{ position: absolute/.test(css), "true");
ck("cells regain their label", /table\.data td::before \{[\s\S]{0,80}attr\(data-label\)/.test(css), "true");
const labels = (js.match(/data-label="/g) || []).length;
ck("cells carry data-label", labels >= 10, "true");
console.log("     (" + labels + " labelled cells)");

console.log("\n== d) language is marked where it changes ==");
ck("the Turkish brief says so", /<article class="brief" lang="tr">/.test(js), "true");

console.log("\n== e) keyboard users can skip the chrome ==");
ck("skip link present", /class="skip" href="#view"/.test(raw), "true");
ck("hidden until focused", /\.skip \{[\s\S]{0,200}translateY\(-120%\)/.test(css), "true");
ck("revealed on focus", /\.skip:focus \{[\s\S]{0,60}translateY\(0\)/.test(css), "true");

console.log("\n== f) toggles announce their state ==");
ck("theme toggle", /aria-pressed[\s\S]{0,60}v === "dark"/.test(js), "true");
ck("density toggle", /aria-pressed[\s\S]{0,60}v === "compact"/.test(js), "true");
ck("live tracking toggle", /aria-pressed="\$\{Sim\.running\}"/.test(js), "true");

console.log("\n== tabs behave like tabs ==");
ck("arrow keys move between tabs", /ArrowLeft\|ArrowRight\|Home\|End/.test(js), "true");
ck("roles are declared", (js.match(/role="tablist"/g) || []).length >= 3, "true");

console.log("\n== jargon is explained once, consistently ==");
const glossary = (core.match(/const GLOSSARY = \{[\s\S]*?\};/) || [""])[0];
["AETR", "ADR", "O-Licence", "MOT", "Ro-Ro", "T1", "SRC", "Driver CPC", "Muayene"].forEach(t => {
  ck("  " + t, glossary.includes('"' + t + '"'), "true");
});
ck("every entry is a real sentence", (glossary.match(/: "[^"]{30,}"/g) || []).length >= 9, "true");

console.log("\n== the sort selector actually orders ==");
const probe = `
Store.state.ui.sort = { key: "km", dir: "asc" };
const asc = S.filtered().map(v => v.km);
Store.state.ui.sort = { key: "km", dir: "desc" };
const desc = S.filtered().map(v => v.km);
ck2("ascending is ascending", asc.every((n, i) => i === 0 || asc[i-1] <= n), "true");
ck2("descending is the reverse", desc[0], asc[asc.length - 1]);
Store.state.ui.sort = { key: "plate", dir: "asc" };
const plates = S.filtered().map(v => v.plate);
ck2("plates sort naturally", plates.every((p, i) => i === 0 || plates[i-1].localeCompare(p, "tr") <= 0), "true");
Store.state.ui.sort = { key: "status", dir: "asc" };
const st = S.filtered().map(v => v.status);
ck2("free trucks come first", st[0], "available");
Store.state.ui.sort = { key: "plate", dir: "asc" };
ck2("filters still work with sorting on", S.filtered().length > 0, "true");
`;
global.ck2 = ck;
try { eval(core + probe.replace(/ck2/g, "global.ck2")); }
catch (e) { found.push("selector probe: " + e.message); console.error("  HATA:", e.message); }

console.log("\n" + (found.length ? found.length + " FAIL" : "hepsi geçti"));
process.exitCode = found.length ? 1 : 0;
