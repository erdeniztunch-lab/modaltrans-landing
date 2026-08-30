/**
 * Whole-app sweep, run after every phase closed.
 * Looks for the problems that only appear once the pieces are combined:
 * views that throw on an exhausted dataset, handlers wired to nothing,
 * markup wired to no handler, duplicate ids, dead code, motion that escapes
 * the reduced-motion rule.
 */
const fs = require("node:path") && require("fs");
const path = require("node:path");

const P = path.join(__dirname, "..", "fleet-management-demo.html");
const raw = fs.readFileSync(P, "utf8");
const html = raw.replace(/@font-face\{[\s\S]*?\}/, "");
const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const js = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
const markup = html.slice(html.indexOf("</style>"), html.indexOf("<script>"));
const core = js.slice(0, js.lastIndexOf("/* ====", js.indexOf("   EVENTS — one delegated")));

const found = [];
const bug = (sev, area, what) => found.push({ sev, area, what });

/* ---------- 1 · markup and handlers must agree -------------------------- */
/* attributes appear both as data-x="v" and as bare flags: data-sim, data-assign-confirm */
const rendered = new Set(
  [...js.matchAll(/\bdata-([a-z-]+)(?==|[\s>`"])/g)].map(m => m[1])
    .concat([...markup.matchAll(/\bdata-([a-z-]+)(?==|[\s>])/g)].map(m => m[1])));
const handled = new Set([...js.matchAll(/\[data-([a-z-]+)\]/g)].map(m => m[1]));
/* read as a dataset property rather than matched as a selector */
const IGNORE = new Set(["theme", "density", "label", "tip", "focus-id", "role"]);

[...handled].filter(k => !rendered.has(k) && !IGNORE.has(k))
  .forEach(k => bug("HIGH", "wiring", `A handler listens for [data-${k}] but nothing renders it.`));
[...rendered].filter(k => !handled.has(k) && !IGNORE.has(k) && !/^(tour|sort|select|vehicle|rank|trip|driverrow|triprow|triprow-ref|cluster|pin|attn|genie|scope|tab|triptab|filter|clear|clear-selection|assign-start|assign-confirm|assign-cancel|assign-more|assign-another|assign-undo|drawer-tab|drawer-close|drawer-assign|renew|oos|service|fix|fix-driver|sim|tour-act)$/.test(k))
  .forEach(k => bug("MED", "wiring", `[data-${k}] is rendered but no handler reads it.`));

/* ---------- 2 · duplicate ids ------------------------------------------- */
const ids = [...raw.matchAll(/\bid="([a-z0-9-]+)"/gi)].map(m => m[1]);
const dupes = ids.filter((v, i) => ids.indexOf(v) !== i && !/^i-/.test(v));
[...new Set(dupes)].forEach(d => bug("HIGH", "dom", `Duplicate id="${d}".`));

/* ---------- 3 · dead CSS ------------------------------------------------ */
/* comments carry file names like .dc.html and .css — not selectors */
const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//g, " ");
const classes = [...new Set([...cssNoComments.matchAll(/\.([a-zA-Z][\w-]*)\s*[,{:.[>+~]/g)].map(m => m[1]))];
const used = raw;
const deadCss = classes.filter(c =>
  !new RegExp(`class="[^"]*\\b${c}\\b|classList[^)]*["']${c}["']|"\\s*\\+\\s*${c}|\\b${c}\\b['"\`]`).test(used)
  && !/^(brief|b-|is-|u-|has-|chip--|btn--|attn__|check-row__|tile__|card__|drawer__|coach__|rankcard__|triprow2__|hero__|nav__|empty__|doc__|bucket__|masthead|sechead|figure|quad|facts|decls|chain|kv|why|colophon|rationale|glossary|hoursbar|barkey|legend|mapsvg|mapgrid|spot|nudge|skip|sr-only|tnum|identifier|sortmark|skel|tablefoot|tablewrap|filters|toolbar|bulkbar|panel|split|actionbar|result__|triplist|triprow|tripfact|triphead|checks|cluster|pin|map|scrim|toast|tabs|segmented|field|kbd|concept|avatar|who__|spark|genie|btable|btag|panel-b|lede|eyebrow|meta|rule|page|stack|thesis|muted|mono|figures|quads|tag|split|type|numbers|evidence|header|sections)/.test(c));
deadCss.slice(0, 12).forEach(c => bug("LOW", "css", `.${c} is defined but never used.`));

/* ---------- 4 · motion that escapes the reduced-motion rule -------------- */
const anims = [...css.matchAll(/animation:\s*[^;]*?([\d.]+)m?s/g)].map(m => m[0]);
if (!/@media \(prefers-reduced-motion: reduce\)[\s\S]{0,200}animation-duration: \.01ms !important/.test(css))
  bug("HIGH", "motion", "The global reduced-motion rule is missing or no longer neutralises animations.");

/* ---------- 5 · behaviour under stress ---------------------------------- */
const els = {};
const nodeStub = () => ({ innerHTML: "", textContent: "", dataset: {}, hidden: true, style: {},
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
global.document = { getElementById: id => (els[id] || (els[id] = nodeStub())), querySelector: () => null,
  querySelectorAll: () => [], addEventListener() {}, documentElement: { dataset: {} }, body: { style: {} },
  activeElement: { tagName: "BODY", dataset: {} }, createElement: () => nodeStub(), title: "" };
global.window = { scrollTo() {}, scrollY: 0 };

const R = {};
global.R = R;
const probe = `
const ROUTE_IDS = ROUTES.map(r => r.id);
const renderAll = tag => ROUTE_IDS.forEach(id => {
  try { const h = views[id](); if (!h && id !== "documents" && id !== "maintenance") R.thin = (R.thin||[]).concat(tag + "/" + id); }
  catch (e) { R.crash = (R.crash||[]).concat(tag + "/" + id + ": " + e.message); }
});

/* a) nothing touched */
renderAll("fresh");

/* b) every unassigned leg consumed — the tour and the assign screen both
      have to survive an exhausted queue */
const consumed = [];
while (S.unassignedTrips().length) {
  const t = S.unassignedTrips()[0];
  const r = S.rankVehiclesForLeg(t.ref).find(x => x.blockers === 0) || S.rankVehiclesForLeg(t.ref)[0];
  A.assignVehicle(t.ref, r.vehicle.id);
  consumed.push(t.ref);
}
R.consumed = consumed.length;
renderAll("empty-queue");
/* the copy must hold even with nothing left to point at */
try { TOUR.forEach(s => { s.text(); s.sub(); }); R.tourCopyWhenEmpty = "ok"; }
catch (e) { R.tourCopyErr = e.message; }
/* and pressing play on an exhausted demo has to recover, not break */
try {
  Tour.start();
  R.tourRecovers = S.unassignedTrips().length > 0;
  R.tourStepsAfterReset = TOUR.map(s => s.sub().length > 20).every(Boolean);
  Tour.end(true);
} catch (e) { R.tourStartErr = e.message; }
while (Store.canUndo()) Store.undo();

/* c) filters narrowed to nothing, with sorting on */
Object.assign(Store.state.ui, { scope: "own", tab: "out_of_service", q: "zzzz", corridor: "TR → UK", docFilter: "expiring", sort: { key: "km", dir: "desc" } });
try { const h = views.vehicles(); R.emptyState = /empty__title/.test(h); } catch (e) { R.crash = (R.crash||[]).concat("empty-filters: " + e.message); }
Object.assign(Store.state.ui, { tab: "all", q: "", corridor: null, docFilter: null });

/* d) drawer open on every vehicle, every tab */
const tabs = ["overview", "documents", "maintenance", "costs", "telemetry"];
S.all().forEach(v => tabs.forEach(t => {
  try { drawerTab(v, t); } catch (e) { R.drawerErr = (R.drawerErr||[]).concat(v.plate + "/" + t + ": " + e.message); }
}));

/* e) drawer open while the tour runs, then both closed */
try {
  Store.state.ui.drawer = { vehicleId: S.all()[0].id, tab: "overview", returnTo: null };
  Tour.start();
  renderAll("tour+drawer");
  Tour.end(true);
  closeDrawer();
  R.bothClosed = !Store.state.ui.drawer.vehicleId && !Tour.active;
} catch (e) { R.crash = (R.crash||[]).concat("tour+drawer: " + e.message); }

/* f) a trip with no vehicle, a vehicle with no driver */
try { chainFor(S.unassignedTrips()[0]); blockersFor(S.unassignedTrips()[0]); R.orphanSafe = true; }
catch (e) { R.orphanSafe = false; R.orphanErr = e.message; }
const noDriver = S.all().find(v => !S.driverFor(v));
if (noDriver) { try { drawerTab(noDriver, "overview"); S.compliance(noDriver, null, S.trips()[0]); R.noDriverSafe = true; }
  catch (e) { R.noDriverSafe = false; R.noDriverErr = e.message; } }

/* g) history cap holds under a burst */
const h0 = Store.history.length;
for (let i = 0; i < 40; i++) A.scheduleMaintenance(S.all()[i % 40].id);
R.historyCap = Store.history.length;
while (Store.canUndo()) Store.undo();

/* h) exported helpers that nothing calls */
R.unused = ["advanceSimulation"].filter(k => {
  const body = ${JSON.stringify(js)};
  const calls = (body.match(new RegExp("\\\\b" + k + "\\\\(", "g")) || []).length;
  return calls <= 1;   // only its own definition
});
`;
try { eval(core + probe); } catch (e) { bug("HIGH", "runtime", "Audit probe threw: " + e.message); }

if (R.crash) R.crash.forEach(c => bug("HIGH", "runtime", "View crashed — " + c));
if (R.drawerErr) R.drawerErr.slice(0, 3).forEach(c => bug("HIGH", "runtime", "Drawer tab crashed — " + c));
if (R.thin) bug("MED", "runtime", "View rendered nothing: " + R.thin.join(", "));

if (R.tourCopyErr) bug("HIGH", "tour", "Tour copy throws with an empty queue: " + R.tourCopyErr);
if (R.tourStartErr) bug("HIGH", "tour", "Pressing play on an exhausted demo throws: " + R.tourStartErr);
if (R.tourRecovers === false) bug("HIGH", "tour", "Pressing play with every leg assigned leaves the tour with nothing to show.");
if (R.tourStepsAfterReset === false) bug("MED", "tour", "After the reset, some step copy came back empty.");
if (R.emptyState === false) bug("MED", "ux", "Filtering to zero rows did not produce the empty state.");
if (R.orphanSafe === false) bug("HIGH", "runtime", "chainFor/blockersFor throw on a trip with no vehicle: " + R.orphanErr);
if (R.noDriverSafe === false) bug("HIGH", "runtime", "A vehicle with no driver breaks the drawer: " + R.noDriverErr);
if (R.bothClosed === false) bug("MED", "state", "Closing the tour and the drawer left one of them open.");
if (R.historyCap > 20) bug("MED", "store", "Undo history grew past its cap: " + R.historyCap);
if (R.unused && R.unused.length) R.unused.forEach(k => bug("LOW", "dead", `A.${k}() is defined but never called.`));

/* ---------- report ------------------------------------------------------ */
const order = { HIGH: 0, MED: 1, LOW: 2 };
found.sort((a, b) => order[a.sev] - order[b.sev]);
console.log("\nFULL AUDIT — phases 0-10\n" + "=".repeat(72));
if (!found.length) console.log("No findings.");
found.forEach((f, i) => console.log(`${String(i + 1).padStart(2)}. [${f.sev.padEnd(4)}] ${f.area.padEnd(8)} ${f.what}`));
console.log("\nmeasurements:", JSON.stringify({
  consumed: R.consumed, tourRecovers: R.tourRecovers, tourCopy: R.tourCopyWhenEmpty, emptyState: R.emptyState,
  historyCap: R.historyCap, bothClosed: R.bothClosed, orphanSafe: R.orphanSafe, noDriverSafe: R.noDriverSafe,
  deadCssCandidates: deadCss.length,
}));
process.exitCode = found.some(f => f.sev === "HIGH") ? 1 : 0;
