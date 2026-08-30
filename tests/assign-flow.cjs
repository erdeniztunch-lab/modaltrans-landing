const fs = require("fs");
const P = require("path").join(__dirname, "..", "fleet-management-demo.html");
const html = fs.readFileSync(P, "utf8");
const js = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
const core = js.slice(0, js.lastIndexOf("/* ====", js.indexOf("   EVENTS — one delegated")));
global.addEventListener = () => {};
global.location = { hash: "" };
global.matchMedia = () => ({ matches: false });
global.localStorage = { getItem: () => null, setItem() {} };
const stubEl = { innerHTML: "", textContent: "", dataset: {}, setAttribute() {}, focus() {}, append() {}, querySelector: () => null, closest: () => null };
global.document = { getElementById: () => stubEl, querySelector: () => null, addEventListener() {}, documentElement: { dataset: {} }, body: { style: {} }, activeElement: { tagName: "BODY", dataset: {} }, createElement: () => ({ style: {}, onclick: null, append() {}, remove() {} }), title: "" };
global.window = { scrollTo() {}, scrollY: 0 };

const probe = `
const ck = (l, v, e) => {
  const ok = e === undefined ? "" : (String(v) === String(e) ? "OK" : "FAIL (expected " + e + ")");
  console.log("  " + l.padEnd(34) + String(v).padStart(6) + "  " + ok);
};

console.log("\\n== ADR leg TR-4482: ranking shape ==");
const r = S.rankVehiclesForLeg("TR-4482");
const clean = r.filter(x => x.blockers === 0);
const hours = r.filter(x => x.blockers === 1 && x.checks.some(c => c.level === "bad" && c.name === "Driver hours"));
const busy  = r.filter(x => x.checks.some(c => c.level === "bad" && c.name === "Vehicle status"));
ck("candidates", r.length, 42);
ck("clean (no blockers)", clean.length);
ck("blocked on driver hours", hours.length, 2);
ck("blocked on status", busy.length);
ck("sorted descending", r.every((x, i) => i === 0 || r[i-1].score >= x.score), "true");

const firstHourIdx = r.findIndex(x => x === hours[0]);
ck("first hours-blocked at index", firstHourIdx);
ck("  ... inside the default 8", firstHourIdx < 8, "true");
ck("hours ranks above busy", hours[0].score > busy[0].score, "true");

console.log("\\n== the fix is machine-runnable ==");
const hb = hours[0];
const dh = hb.checks.find(c => c.name === "Driver hours");
ck("has act", !!dh.act, "true");
ck("act type", dh.act && dh.act.type, "swapDriver");
ck("act names a driver", !!(dh.act && dh.act.driverId), "true");
const alt = S.drivers().find(d => d.id === dh.act.driverId);
ck("alt driver has hours", alt.minutesLeft >= S.tripByRef("TR-4482").legMin, "true");

console.log("\\n== applying the fix unblocks ==");
const trip = S.tripByRef("TR-4482");
const after = S.compliance(hb.vehicle, alt, trip);
ck("blockers before", hb.blockers, 1);
ck("blockers after swap", after.filter(c => c.level === "bad").length, 0);

console.log("\\n== ADR gate ==");
const noAdr = r.find(x => !x.vehicle.adr);
ck("non-ADR vehicle is blocked", noAdr.checks.some(c => c.level === "bad" && c.name === "ADR certificate"), "true");
const adrTrip = S.tripByRef("TR-4490");
const sameOnPlain = S.compliance(noAdr.vehicle, S.driverFor(noAdr.vehicle), adrTrip);
ck("... but fine on a non-ADR leg", sameOnPlain.some(c => c.name === "ADR certificate"), "false");

console.log("\\n== other fixes carry actions ==");
const expired = S.all().find(v => v.docs.state === "expired");
const ec = S.compliance(expired, S.driverFor(expired), trip).find(c => c.name === "Documents");
ck("expired docs -> renew", ec.act && ec.act.type, "renew");
const od = S.all().find(v => v.maint.state === "overdue");
const mc = S.compliance(od, S.driverFor(od), trip).find(c => c.name === "Maintenance");
ck("overdue maint -> service", mc.act && mc.act.type, "service");

console.log("\\n== confirm ripples, then undo ==");
const beforeUn = S.unassignedTrips().length;
const beforeOn = S.by("on_trip");
const choice = clean[0];
A.assignVehicle("TR-4482", choice.vehicle.id, null);
const t2 = S.tripByRef("TR-4482");
ck("unassigned 5 -> 4", S.unassignedTrips().length, beforeUn - 1);
ck("on trip +1", S.by("on_trip") - beforeOn, 1);
ck("U-ETDS filed", t2.declarations.uetds, "filed");
ck("GVMS drafted (UK leg)", t2.declarations.gvms, "draft");
ck("cost computed", t2.cost.total > 0, "true");
ck("CO2e computed", t2.co2eKg > 0, "true");
ck("vehicle now on trip", Store.state.vehicles.find(v => v.id === choice.vehicle.id).status, "on_trip");
A.undo();
ck("undo restores unassigned", S.unassignedTrips().length, beforeUn);
ck("undo restores on trip", S.by("on_trip"), beforeOn);
ck("undo restores vehicle", Store.state.vehicles.find(v => v.id === choice.vehicle.id).status, "available");

console.log("\\n== view renders without a DOM ==");
Store.state.ui.assign = { tripRef: "TR-4482", vehicleId: null, driverId: null, showAll: false, done: null };
const h1 = views.assign();
ck("empty selection renders", h1.length > 500, "true");
ck("  ranked cards present", (h1.match(/data-rank=/g) || []).length > 0, "true");
ck("  confirm disabled", /data-assign-confirm[^>]*disabled/.test(h1), "true");
Store.state.ui.assign.vehicleId = hb.vehicle.id;
const h2 = views.assign();
ck("blocked selection renders checks", /check-row/.test(h2), "true");
ck("  confirm still disabled", /data-assign-confirm[^>]*disabled/.test(h2), "true");
ck("  fix button offered", /data-fix="swapDriver"/.test(h2), "true");
Store.state.ui.assign.driverId = dh.act.driverId;
const h3 = views.assign();
ck("after fix, confirm enabled", /data-assign-confirm[^>]*disabled/.test(h3), "false");
Store.state.ui.assign = { tripRef: "TR-4482", vehicleId: clean[0].vehicle.id, driverId: null, showAll: false, done: null };
ck("clean pick enables confirm", /data-assign-confirm[^>]*disabled/.test(views.assign()), "false");
A.assignVehicle("TR-4482", clean[0].vehicle.id, null);
Store.state.ui.assign.done = { tripRef: "TR-4482", vehicleId: clean[0].vehicle.id };
const h4 = views.assign();
ck("result panel renders", /result__row/.test(h4), "true");
ck("  shows six lines", (h4.match(/result__row/g) || []).length, 6);
ck("  shows the chain", /chain__node/.test(h4), "true");
A.undo();
`;

try { eval(core + probe); }
catch (e) { console.error("\nHATA:", e.message, "\n" + e.stack.split("\n").slice(0, 5).join("\n")); process.exit(1); }
