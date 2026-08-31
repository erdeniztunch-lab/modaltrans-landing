const fs = require("fs");
const P = require("path").join(__dirname, "..", "fleet-management-demo.html");
const html = fs.readFileSync(P, "utf8");
const js = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
const core = js.slice(0, js.lastIndexOf("/* ====", js.indexOf("   EVENTS — one delegated")));

const els = {};
const el = () => ({ innerHTML: "", textContent: "", dataset: {}, setAttribute() {}, focus() {}, append() {},
                    querySelector: () => ({ focus() {} }), querySelectorAll: () => [] });
let REDUCED = false;
global.addEventListener = () => {};
global.location = { hash: "" };
global.matchMedia = q => ({ matches: /reduce/.test(q) ? REDUCED : false });
global.localStorage = { getItem: () => null, setItem: () => {} };
global.document = {
  getElementById: id => (els[id] || (els[id] = el())),
  querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
  documentElement: { dataset: {} }, body: { style: {} },
  activeElement: { tagName: "BODY", dataset: {} },
  createElement: () => ({ style: {}, onclick: null, append() {}, remove() {} }), title: "",
};
global.window = { scrollTo() {}, scrollY: 0 };
global.setInterval = () => 1;
global.clearInterval = () => {};
global.setTimeout = () => 1;
global.__setReduced = v => { REDUCED = v; };

const probe = String.raw`
const ck = (l, v, e) => {
  const ok = e === undefined ? "" : (String(v) === String(e) ? "OK" : "FAIL (expected " + e + ")");
  console.log("  " + l.padEnd(44) + String(v).padStart(6) + "  " + ok);
};

console.log("\n== the projection is a real projection ==");
/* Equidistant cylindrical, standard parallel 45N. Shape is true where the
   ratio of the scales equals cos(lat); at 45 that is exactly the parallel. */
ck("standard parallel", Math.round(Math.acos(PROJ.cos0) * 180 / Math.PI), 45);
const inv = ([x, y]) => [x / (PROJ.cos0 * PROJ.k) + PROJ.lon0, PROJ.lat0 - y / PROJ.k];
const round2 = n => Math.round(n * 100) / 100;
ck("projection is invertible", Object.entries(PLACE).every(([n, ll]) => {
  const [lon, lat] = inv(project(ll));
  return Math.abs(lon - ll[0]) < 0.02 && Math.abs(lat - ll[1]) < 0.02;
}), "true");
/* Every city has to be where an atlas puts it, not where the layout wants it. */
const ATLAS = { Manchester: [-2.24, 53.48], Calais: [1.86, 50.95], Dover: [1.31, 51.13],
                "München": [11.58, 48.14], Belgrade: [20.45, 44.79], "İstanbul": [28.98, 41.01],
                Mersin: [34.63, 36.80], "Köstence": [28.63, 44.18] };
ck("cities match the atlas", Object.entries(ATLAS).every(([n, ll]) =>
  Math.abs(PLACE[n][0] - ll[0]) < 0.01 && Math.abs(PLACE[n][1] - ll[1]) < 0.01), "true");
ck("everything fits the box", Object.values(CITY)
  .every(([x, y]) => x >= 0 && x <= MAP_W && y >= 0 && y <= MAP_H), "true");
ck("north is above south", CITY.Manchester[1] < CITY.Mersin[1], "true");
ck("west is left of east", CITY.Manchester[0] < CITY["İstanbul"][0], "true");

console.log("\n== land and sea ==");
const svg = mapSvg();
ck("coastlines are drawn", (svg.match(/<polygon /g) || []).length >= 8, "true");
ck("britain is an island", LAND.length >= 2, "true");
ck("the straits are painted back as sea", INLAND_SEA.length >= 1, "true");
ck("land uses the same projection as the cities",
  poly(LAND[1]).split(" ")[0], project(LAND[1][0]).join(","));
/* Dover sits on Great Britain, Calais does not. A point-in-polygon test on the
   projected ring is the only way to know the coast is not decoration. */
const inside = ([px, py], ring) => {
  const p = ring.map(project);
  let hit = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i], [xj, yj] = p[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};
const GB = LAND[1];
ck("Dover is on the island", inside(CITY.Dover, GB), "true");
ck("Manchester is on the island", inside(CITY.Manchester, GB), "true");
ck("Calais is not", inside(CITY.Calais, GB), "false");
ck("İstanbul is not", inside(CITY["İstanbul"], GB), "false");
const EUROPE = LAND[0];
ck("İstanbul is on the mainland", inside(CITY["İstanbul"], EUROPE), "true");
ck("Mersin is on the mainland", inside(CITY.Mersin, EUROPE), "true");
ck("Belgrade is on the mainland", inside(CITY.Belgrade, EUROPE), "true");
ck("Köstence is on the mainland", inside(CITY["Köstence"], EUROPE), "true");
/* the Black Sea is a notch, not filled land */
ck("the Black Sea is water", inside(project([32.0, 43.5]), EUROPE), "false");
ck("the Aegean is water", inside(project([25.0, 38.0]), EUROPE), "false");
ck("the Adriatic is water", inside(project([16.0, 42.5]), EUROPE), "false");

console.log("\n== the graticule is a graticule ==");
const meridians = [...svg.matchAll(/<line x1="([\d.]+)" y1="0"/g)].map(m => +m[1]);
const parallels = [...svg.matchAll(/<line x1="0" y1="([\d.]+)"/g)].map(m => +m[1]);
ck("meridians land on round degrees",
  meridians.every(x => Math.abs(round2(inv([x, 0])[0]) % 5) < 0.01), "true");
ck("parallels land on round degrees",
  parallels.every(y => Math.abs(round2(inv([0, y])[1]) % 5) < 0.01), "true");

console.log("\n== every run is drawn to its own endpoints ==");
const live = S.trips().filter(t => t.status === "active");
ck("every trip has a route", live.every(t => routeFor(t).length >= 2), "true");
ck("every waypoint has coordinates", live.every(t => routeFor(t).every(n => NODE[n])), "true");
ck("routes start at the real origin", live.every(t => routeFor(t)[0] === t.origin), "true");
ck("routes end at the real destination",
  live.every(t => routeFor(t).slice(-1)[0] === t.destination), "true");
ck("no waypoint is repeated back to back",
  live.every(t => routeFor(t).every((n, i, a) => i === 0 || n !== a[i - 1])), "true");
const dests = new Set(live.map(t => t.destination));
ck("more than one destination is drawn", dests.size > 4, "true");
ck("every place a trip names is on the map",
  S.trips().every(t => PLACE[t.origin] && PLACE[t.destination]), "true");

console.log("\n== the corridor label tells the truth ==");
const COUNTRY = { Manchester: "UK", Birmingham: "UK", Dover: "UK", Calais: "FR", Lyon: "FR",
  Antwerp: "BE", Rotterdam: "NL", Duisburg: "DE", "München": "DE", Trieste: "IT",
  "Köstence": "RO", Sofia: "BG" };
const bad = S.trips().filter(t => {
  const want = t.corridor.split(" → ")[1];
  const got = COUNTRY[t.destination];
  return want !== "TR" && got && got !== want && !(want === "NL" && got === "BE");
});
ck("no trip is delivered to the wrong country", bad.length, 0);
if (bad.length) bad.slice(0, 3).forEach(t => console.log("      " + t.ref + " " + t.corridor + " -> " + t.destination));

console.log("\n== the pin and the trip chain agree ==");
/* A truck showing "Ro-Ro" must be drawn at the ferry, not in the Balkans. */
const near = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
let worst = 0, worstRef = "";
live.forEach(t => {
  const m = milestones(t), p = Math.max(0, Math.min(5, t.progress ?? 0));
  const anchor = pointOn(routeFor(t), m[p]);
  const next = pointOn(routeFor(t), p < 5 ? m[p + 1] : 1);
  const at = tripPosition(t);
  /* it has to sit on the leg between the milestone it reached and the next */
  const onLeg = near(at, anchor) + near(at, next) <= near(anchor, next) + 0.5;
  if (!onLeg) { worst++; worstRef = t.ref; }
});
ck("every truck sits on the leg it is running", worst, 0);
const uk = live.find(t => t.corridor === "TR → UK");
if (uk) {
  const atRoRo = pointOn(routeFor(uk), milestones(uk)[2]);
  ck("the Ro-Ro milestone is at Calais", Math.round(near(atRoRo, CITY.Calais)), 0);
  const atGvms = pointOn(routeFor(uk), milestones(uk)[4]);
  ck("the GVMS milestone is at Dover", Math.round(near(atGvms, CITY.Dover)), 0);
}
ck("milestones never go backwards",
  live.every(t => milestones(t).every((f, i, a) => i === 0 || f >= a[i - 1])), "true");
ck("milestones start at nought and end at one",
  live.every(t => milestones(t)[0] === 0 && milestones(t)[5] <= 1), "true");

console.log("\n== positions ==");
ck("every live trip is placeable", live.every(t => {
  const [x, y] = tripPosition(t);
  return Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= MAP_W && y >= 0 && y <= MAP_H;
}), "true");
const sample = live[0];
const early = tripPosition({ ...sample, progress: 0, legProgress: 0 });
const late = tripPosition({ ...sample, progress: 5, legProgress: 1 });
ck("progress moves the truck", early[0] !== late[0] || early[1] !== late[1], "true");
ck("it starts on its own origin", Math.round(near(early, CITY[sample.origin])), 0);
ck("it ends on its own destination", Math.round(near(late, CITY[sample.destination])), 0);
ck("fraction is clamped", tripFraction({ corridor: "TR → UK", progress: 99, legProgress: 9 }) <= 1, "true");
/* trucks must not all pile onto the same dot */
const spots = new Set(live.map(t => tripPosition(t).map(n => Math.round(n / 3)).join(",")));
ck("trucks are spread, not stacked", spots.size >= 6, "true");

console.log("\n== clustering ==");
const m = mapMarkers();
ck("markers cover every live trip", m.singles.length + m.clusters.reduce((s, c) => s + c.members.length, 0), live.length);
ck("delayed trips are never clustered", m.clusters.every(c => c.members.every(e => !e.trip.delayed)), "true");
ck("blocked trips are never clustered", m.clusters.every(c => c.members.every(e => blockersFor(e.trip) === 0)), "true");
ck("clusters hold three or more", m.clusters.every(c => c.members.length >= 3), "true");
ck("28 trucks do not become 28 pins", m.singles.length < live.length, "true");

console.log("\n== the ticker keeps out of the undo history ==");
const h0 = Store.history.length;
Store.tick(st => { st.trips[0].legProgress = 0.01; });
ck("tick writes no history", Store.history.length, h0);
A.advanceSimulation();
ck("advanceSimulation writes none either", Store.history.length, h0);
A.assignVehicle("TR-4490", S.rankVehiclesForLeg("TR-4490").find(r => r.blockers === 0).vehicle.id);
ck("a real action still does", Store.history.length, h0 + 1);
A.undo();
ck("and undo still works", Store.history.length, h0);

console.log("\n== the ticker moves everything at one speed ==");
/* A short corridor used to make its trucks sprint, because the step was a
   fraction of the route rather than a distance across the ground.
   Undo above replaced the state objects, so the trips are read again here. */
const running = S.trips().filter(t => t.status === "active");
const before = new Map(running.map(t => [t.ref, tripPosition(t)]));
Sim.seconds = 0; Sim.fired = true;
Sim.step();
const moved = running.map(t => near(before.get(t.ref), tripPosition(t))).filter(d => d > 0);
ck("something moved", moved.length > 0, "true");
const spread = Math.max(...moved) / Math.max(0.0001, Math.min(...moved));
ck("fastest is within 3x of slowest", spread < 3, "true");
ck("nobody runs past the end of the leg",
  running.every(t => (t.legProgress ?? 0) <= 1), "true");

console.log("\n== a delay lands ==");
const lateBefore = S.delayedTrips().length;
Sim.seconds = 19; Sim.fired = false;
Sim.step();
ck("one more trip is late", S.delayedTrips().length, lateBefore + 1);
ck("it carries a reason", S.delayedTrips().every(t => t.delayReason && t.delayReason.length > 10), "true");
ck("it only fires once", (Sim.seconds = 19, Sim.step(), S.delayedTrips().length), lateBefore + 1);

console.log("\n== reduced motion ==");
Sim.stop();
__setReduced(true);
Sim.start();
ck("ticker refuses to start", Sim.running, "false");
ck("positions are still correct", live.every(t => Number.isFinite(tripPosition(t)[0])), "true");
__setReduced(false);

console.log("\n== the map actually draws ==");
ck("svg present", /<svg class="mapsvg"/.test(svg), "true");
ck("has a label", /aria-label="Corridor map/.test(svg), "true");
ck("draws road segments", (svg.match(/<line /g) || []).length > 20, "true");
ck("has dashed ferry legs", /stroke-dasharray/.test(svg), "true");
ck("names the big nodes", /İstanbul/.test(svg) && /Manchester/.test(svg), "true");
ck("names the cities the app talks about", /Calais/.test(svg) && /Kapıkule/.test(svg), "true");
/* labels that overlap are worse than no labels */
/* Compare where the text actually starts, not where the dot is: two names on
   the same line only clash when they run towards each other. */
/* Work out the box each name occupies. At font-size 2.1 a glyph averages about
   1.15 units wide; "start" runs right from its point, "end" runs left. */
const named = Object.keys(LABEL);
const box = n => {
  const [dx, dy, anchor] = LABEL[n];
  const x = CITY[n][0] + dx, w = n.length * 1.15;
  return { x1: anchor === "end" ? x - w : x, x2: anchor === "end" ? x : x + w,
           y: CITY[n][1] + dy };
};
const collisions = [];
named.forEach((a2, i) => named.slice(i + 1).forEach(b2 => {
  const p = box(a2), q = box(b2);
  if (Math.abs(p.y - q.y) < 1.8 && p.x1 < q.x2 && q.x1 < p.x2) collisions.push(a2 + "/" + b2);
}));
ck("no two labels collide", collisions.length, 0);
if (collisions.length) console.log("      " + collisions.join(", "));

console.log("\n== the pins share the road's coordinate space ==");
/* The svg is stretched to the container, and the container is given the
   viewBox's own ratio, so a percentage means the same thing to both. */
ck("svg does not letterbox", /preserveAspectRatio="none"/.test(svg), "true");
const css = html.slice(html.indexOf("<style>"), html.indexOf("</style>"));
ck("the box carries the viewBox ratio", /aspect-ratio:\s*100\s*\/\s*64/.test(css), "true");
/* A fixed height anywhere would break that ratio again and float the pins off
   the roads, which is the defect this whole arrangement exists to prevent. */
const mapRules = [...css.matchAll(/\.map\s*\{([^}]*)\}/g)].map(m3 => m3[1]);
ck("no rule pins the map to a height", mapRules.some(r => /height\s*:/.test(r)), "false");
ck("the map is centred and capped", /width:\s*min\(100%,\s*40rem\)/.test(css), "true");
const markers = mapMarkersHtml();
const pcts = [...markers.matchAll(/left:([\d.]+)%;top:([\d.]+)%/g)].map(m2 => [+m2[1], +m2[2]]);
ck("pins are placed as percentages", pcts.length > 0, "true");
ck("pins stay inside the box", pcts.every(([x, y]) => x >= 0 && x <= 100 && y >= 0 && y <= 100), "true");
ck("pins carry the plate", /aria-label="\d\d /.test(markers), "true");
ck("pins open a vehicle", /data-vehicle=/.test(markers), "true");
const panel = mapPanel(S.tripByRef("TR-4471"));
ck("panel has a pause control", /data-sim/.test(panel), "true");
ck("panel keeps the legend", /legend__dash/.test(panel), "true");
ck("overview still renders", views.overview().length > 2000, "true");
`;

try { eval(core + probe); }
catch (e) { console.error("\nHATA:", e.message, "\n" + e.stack.split("\n").slice(0, 5).join("\n")); process.exit(1); }
