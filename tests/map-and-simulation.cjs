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

const probe = `
const ck = (l, v, e) => {
  const ok = e === undefined ? "" : (String(v) === String(e) ? "OK" : "FAIL (expected " + e + ")");
  console.log("  " + l.padEnd(40) + String(v).padStart(6) + "  " + ok);
};

console.log("\\n== geography ==");
const corridorsInUse = [...new Set(S.trips().map(t => t.corridor))];
ck("corridors used by trips", corridorsInUse.length);
ck("every one has a route", corridorsInUse.every(c => CORRIDOR_ROUTES[c]), "true");
ck("every waypoint has coordinates", Object.values(CORRIDOR_ROUTES)
  .every(r => r.via.every(c => CITY[c])), "true");
ck("routes have at least two stops", Object.values(CORRIDOR_ROUTES).every(r => r.via.length >= 2), "true");
ck("cities sit inside the viewBox", Object.values(CITY)
  .every(([x, y]) => x >= 0 && x <= 100 && y >= 0 && y <= 60), "true");
ck("ferry legs are marked", CORRIDOR_ROUTES["TR → UK"].sea.length > 0, "true");

console.log("\\n== positions ==");
const live = S.trips().filter(t => t.status === "active");
ck("every live trip is placeable", live.every(t => {
  const [x, y] = tripPosition(t);
  return Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= 100 && y >= 0 && y <= 60;
}), "true");
const sample = live[0];
const early = tripPosition({ ...sample, progress: 0, drift: 0 });
const late = tripPosition({ ...sample, progress: 5, drift: 0 });
ck("progress moves the truck", early[0] !== late[0] || early[1] !== late[1], "true");
ck("start sits on the first waypoint", Math.round(early[0]), Math.round(CITY[CORRIDOR_ROUTES[sample.corridor].via[0]][0]));
ck("fraction is clamped", tripFraction({ progress: 99, drift: 9 }) <= 1, "true");

console.log("\\n== clustering ==");
const m = mapMarkers();
ck("markers cover every live trip", m.singles.length + m.clusters.reduce((s, c) => s + c.members.length, 0), live.length);
ck("delayed trips are never clustered", m.clusters.every(c => c.members.every(e => !e.trip.delayed)), "true");
ck("blocked trips are never clustered", m.clusters.every(c => c.members.every(e => blockersFor(e.trip) === 0)), "true");
ck("clusters hold three or more", m.clusters.every(c => c.members.length >= 3), "true");
ck("28 trucks do not become 28 pins", m.singles.length < live.length, "true");

console.log("\\n== the ticker keeps out of the undo history ==");
const h0 = Store.history.length;
Store.tick(st => { st.trips[0].drift = 0.01; });
ck("tick writes no history", Store.history.length, h0);
A.advanceSimulation();
ck("advanceSimulation writes none either", Store.history.length, h0);
A.assignVehicle("TR-4490", S.rankVehiclesForLeg("TR-4490").find(r => r.blockers === 0).vehicle.id);
ck("a real action still does", Store.history.length, h0 + 1);
A.undo();
ck("and undo still works", Store.history.length, h0);

console.log("\\n== a delay lands ==");
const lateBefore = S.delayedTrips().length;
Sim.seconds = 19; Sim.fired = false;
Sim.step();
ck("one more trip is late", S.delayedTrips().length, lateBefore + 1);
ck("it carries a reason", S.delayedTrips().every(t => t.delayReason && t.delayReason.length > 10), "true");
ck("it only fires once", (Sim.seconds = 19, Sim.step(), S.delayedTrips().length), lateBefore + 1);

console.log("\\n== reduced motion ==");
Sim.stop();
__setReduced(true);
Sim.start();
ck("ticker refuses to start", Sim.running, "false");
const stillPlaced = live.every(t => Number.isFinite(tripPosition(t)[0]));
ck("positions are still correct", stillPlaced, "true");
__setReduced(false);

console.log("\\n== the map actually draws ==");
const svg = mapSvg();
ck("svg present", /<svg class="mapsvg"/.test(svg), "true");
ck("has a label", /aria-label="Corridor map/.test(svg), "true");
ck("draws road segments", (svg.match(/<line /g) || []).length > 20, "true");
ck("has dashed ferry legs", /stroke-dasharray/.test(svg), "true");
ck("names the big nodes", /İstanbul/.test(svg) && /Manchester/.test(svg), "true");
const markers = mapMarkersHtml();
ck("pins carry the plate", /aria-label="\\d\\d /.test(markers), "true");
ck("pins open a vehicle", /data-vehicle=/.test(markers), "true");
const panel = mapPanel(S.tripByRef("TR-4471"));
ck("panel has a pause control", /data-sim/.test(panel), "true");
ck("panel keeps the legend", /legend__dash/.test(panel), "true");
ck("overview still renders", views.overview().length > 2000, "true");
`;

try { eval(core + probe); }
catch (e) { console.error("\nHATA:", e.message, "\n" + e.stack.split("\n").slice(0, 5).join("\n")); process.exit(1); }
