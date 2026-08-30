/* QA sweep over the closed phases (0-6). Hunts for real defects rather than
   re-running the suites — data contradictions, badge/table disagreements,
   dead keyboard paths, views that throw. */
const fs = require("fs");
const P = require("path").join(__dirname, "..", "fleet-management-demo.html");
const html = fs.readFileSync(P, "utf8");
const js = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const core = js.slice(0, js.lastIndexOf("/* ====", js.indexOf("   EVENTS — one delegated")));

const found = [];
const bug = (sev, area, what) => found.push({ sev, area, what });

/* ---------- source-level checks ------------------------------------------ */
if (!/table\.data tbody tr:focus-visible/.test(css))
  bug("HIGH", "a11y", "Table rows can be focused but have no visible focus ring.");
if (/<tr data-vehicle="\$\{v\.id\}"(?![^>]*tabindex)/.test(js))
  bug("HIGH", "a11y", "Vehicle rows are clickable but not keyboard-reachable.");
if (/data-triprow=/.test(js) && !/\[data-triprow\]/.test(js.slice(js.indexOf("keydown"))))
  bug("HIGH", "a11y", "Trip rows are clickable but not in the keyboard activation selector.");
if (/data-driverrow=/.test(js) && !/\[data-driverrow\]/.test(js.slice(js.indexOf("keydown"))))
  bug("HIGH", "a11y", "Driver rows are clickable but not in the keyboard activation selector.");
if (!/aria-modal="true"/.test(js)) bug("HIGH", "a11y", "Drawer is not marked as a modal dialog.");
if (!/input\[type="search"\]::-webkit-search-cancel-button/.test(css))
  bug("LOW", "visual", "Native search clear button collides with the / hint.");
if (/\$\{activeFilters\.length\} filter\$\{activeFilters\.length === 1 \? " is" : "s are"\} active at once/.test(js))
  bug("MED", "copy", "Empty state blames filters even when a tab caused the empty result.");

/* ---------- behavioural checks ------------------------------------------- */
const els = {};
const el = () => ({ innerHTML: "", textContent: "", dataset: {}, setAttribute() {}, focus() {}, append() {},
                    querySelector: () => ({ focus() {} }) });
global.addEventListener = () => {};
global.location = { hash: "" };
global.matchMedia = () => ({ matches: false });
global.localStorage = { getItem: () => null, setItem() {} };
global.document = {
  getElementById: id => (els[id] || (els[id] = el())),
  querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
  documentElement: { dataset: {} }, body: { style: {} },
  activeElement: { tagName: "BODY", dataset: {} },
  createElement: () => ({ style: {}, onclick: null, append() {}, remove() {} }), title: "",
};
global.window = { scrollTo() {}, scrollY: 0 };

const R = {};
global.R = R;
const probe = `
const A_ = A, S_ = S;
/* one truck, one live trip */
const live = S.trips().filter(t => t.status === "active");
const perVehicle = {};
live.forEach(t => { perVehicle[t.vehicleId] = (perVehicle[t.vehicleId] || 0) + 1; });
R.doubleBooked = Object.entries(perVehicle).filter(([, n]) => n > 1).length;

const perDriver = {};
live.forEach(t => { if (t.driverId) perDriver[t.driverId] = (perDriver[t.driverId] || 0) + 1; });
R.driverDoubleBooked = Object.entries(perDriver).filter(([, n]) => n > 1).length;

/* the driver on a trip should be the driver on that truck */
R.driverMismatch = live.filter(t => {
  const v = S.all().find(x => x.id === t.vehicleId);
  const d = v && S.driverFor(v);
  return d && t.driverId && d.id !== t.driverId;
}).length;

/* trucks marked on_trip with no live trip behind them */
R.onTripNoTrip = S.all().filter(v => v.status === "on_trip" && !live.some(t => t.vehicleId === v.id)).length;
R.onTripTotal = S.by("on_trip");

/* trips pointing at vehicles that do not exist */
R.orphanTrips = S.trips().filter(t => t.vehicleId && !S.all().some(v => v.id === t.vehicleId)).length;
/* drivers pointing at vehicles that do not exist */
R.orphanDrivers = S.drivers().filter(d => d.vehicleId && !S.all().some(v => v.id === d.vehicleId)).length;
/* two drivers on the same truck */
const dv = {};
S.drivers().filter(d => d.vehicleId).forEach(d => { dv[d.vehicleId] = (dv[d.vehicleId] || 0) + 1; });
R.sharedTruck = Object.entries(dv).filter(([, n]) => n > 1).length;

/* rail badges must agree with what the destination shows */
Object.assign(Store.state.ui, { scope: "own", tab: "all", q: "", corridor: null, docFilter: "expiring" });
R.docRows = S.filtered().length; R.docBadge = S.docsNeedingWork("own");
Object.assign(Store.state.ui, { scope: "own", tab: "attention", q: "", corridor: null, docFilter: null });
R.maintRows = S.filtered().length; R.maintBadge = S.maintOverdue();
R.tripBadge = S.unassignedTrips().length; R.tripRows = S.trips().filter(t => t.status === "unassigned").length;

/* every view renders for every route without throwing */
Object.assign(Store.state.ui, { scope: "own", tab: "all", q: "", corridor: null, docFilter: null });
R.viewErrors = [];
["overview", "vehicles", "trips", "drivers", "documents", "maintenance", "assign"].forEach(id => {
  try { const h = views[id](); if (!h || h.length < 200) R.viewErrors.push(id + " (thin)"); }
  catch (e) { R.viewErrors.push(id + ": " + e.message); }
});

/* assigning from anywhere must move the Trips numbers too */
const beforeUn = S.unassignedTrips().length, beforeActive = live.length;
const cand = S.rankVehiclesForLeg("TR-4490").find(r => r.blockers === 0);
R.hadCandidate = !!cand;
if (cand) {
  A.assignVehicle("TR-4490", cand.vehicle.id);
  R.unassignedAfter = S.unassignedTrips().length;
  R.activeAfter = S.trips().filter(t => t.status === "active").length;
  R.newTripHasChain = chainFor(S.tripByRef("TR-4490")).length === 6;
  R.newTripUetds = S.tripByRef("TR-4490").declarations.uetds;
  A.undo();
  R.unassignedRestored = S.unassignedTrips().length;
}
R.beforeUn = beforeUn; R.beforeActive = beforeActive;

/* undo history must not leak across action types */
const h0 = Store.history.length;
A.renewDocument(S.all()[0].id);
A.scheduleMaintenance(S.all()[1].id);
A.undo(); A.undo();
R.historyBalanced = Store.history.length === h0;
`;
try { eval(core + probe); }
catch (e) { bug("HIGH", "runtime", "QA probe threw: " + e.message); }

if (R.doubleBooked) bug("HIGH", "data", `${R.doubleBooked} vehicle(s) are running two live trips at once.`);
if (R.driverDoubleBooked) bug("HIGH", "data", `${R.driverDoubleBooked} driver(s) are on two live trips at once.`);
if (R.driverMismatch) bug("MED", "data", `${R.driverMismatch} trip(s) name a different driver than the one on the truck.`);
if (R.orphanTrips) bug("HIGH", "data", `${R.orphanTrips} trip(s) point at a vehicle that does not exist.`);
if (R.orphanDrivers) bug("HIGH", "data", `${R.orphanDrivers} driver(s) point at a vehicle that does not exist.`);
if (R.sharedTruck) bug("HIGH", "data", `${R.sharedTruck} truck(s) have more than one driver on them.`);
if (R.onTripNoTrip > 0)
  bug("MED", "fiction", `${R.onTripNoTrip} of ${R.onTripTotal} trucks are marked "on trip" with no trip record behind them — clicking one shows an empty Current trip.`);
if (R.docRows !== R.docBadge) bug("HIGH", "data", `Documents badge ${R.docBadge} vs ${R.docRows} rows at the destination.`);
if (R.maintRows !== R.maintBadge) bug("HIGH", "data", `Maintenance badge ${R.maintBadge} vs ${R.maintRows} rows at the destination.`);
if (R.tripRows !== R.tripBadge) bug("HIGH", "data", `Trips badge ${R.tripBadge} vs ${R.tripRows} unassigned trips.`);
if (R.viewErrors && R.viewErrors.length) bug("HIGH", "runtime", "View problems: " + R.viewErrors.join(" · "));
if (R.hadCandidate === false) bug("MED", "data", "TR-4490 has no clean candidate — the happy path is unreachable for that leg.");
if (R.hadCandidate && R.unassignedAfter !== R.beforeUn - 1) bug("HIGH", "actions", "Assigning did not reduce the unassigned count.");
if (R.hadCandidate && R.activeAfter !== R.beforeActive + 1) bug("HIGH", "actions", "Assigning did not raise the active count.");
if (R.hadCandidate && R.newTripUetds !== "filed") bug("HIGH", "actions", "A newly assigned trip did not file U-ETDS.");
if (R.hadCandidate && R.unassignedRestored !== R.beforeUn) bug("HIGH", "actions", "Undo did not restore the unassigned count.");
if (R.historyBalanced === false) bug("MED", "store", "Undo history is not balanced after mixed actions.");

const order = { HIGH: 0, MED: 1, LOW: 2 };
found.sort((a, b) => order[a.sev] - order[b.sev]);
console.log("\nQA — Faz 0-6\n" + "=".repeat(66));
if (!found.length) console.log("Bulgu yok.");
found.forEach((f, i) => console.log(`${i + 1}. [${f.sev}] ${f.area.padEnd(9)} ${f.what}`));
console.log("\nölçümler:", JSON.stringify(R));
