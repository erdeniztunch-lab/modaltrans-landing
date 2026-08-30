const fs = require("fs");
const html = fs.readFileSync(require("path").join(__dirname, "..", "fleet-management-demo.html"), "utf8");
const js = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
const cut = js.indexOf("   PREFERENCES");
const core = js.slice(0, js.lastIndexOf("/* ====", cut));

const probe = `
const ck = (l, v, e) => {
  const ok = e === undefined ? "" : (String(v) === String(e) ? "OK" : "FAIL (expected " + e + ")");
  console.log("  " + l.padEnd(26) + String(v).padStart(8) + "  " + ok);
};

console.log("\\n== counts ==");
ck("vehicles", S.all().length, 42);
ck("on trip", S.by("on_trip"), 28);
ck("available", S.by("available"), 8);
ck("maintenance", S.by("maintenance"), 4);
ck("out of service", S.by("out_of_service"), 2);
ck("utilisation %", S.utilisation(), 78);
ck("docs expiring <=30d", S.docsExpiring(), 12);
ck("maint overdue", S.maintOverdue(), 3);
ck("need attention", S.needAttention(), 7);
ck("cost per km EUR", S.costPerKm());
ck("unassigned trips", S.unassignedTrips().length, 5);
/* Every truck marked "on trip" now carries exactly one live trip */
ck("active trips", S.activeTrips().length, 28);
ck("  ... one per on-trip truck", S.activeTrips().length, S.by("on_trip"));
ck("drivers near limit", S.driversNearLimit(), 2);
ck("free drivers", S.freeDrivers().length, 3);

console.log("\\n== ranking for TR-4482 (ADR load) ==");
const rank = S.rankVehiclesForLeg("TR-4482");
console.log("  candidates:", rank.length);
rank.slice(0, 3).forEach((r, i) => {
  console.log("  " + (i + 1) + ". " + r.vehicle.plate + "  score " + String(r.score).padStart(3) +
              "  blockers " + r.blockers + "  — " + r.reason);
});
const worst = rank[rank.length - 1];
console.log("  last: " + worst.vehicle.plate + "  score " + worst.score + "  — " + worst.reason);
const noAdr = rank.find(r => !r.vehicle.adr);
console.log("  ADR gate works:", noAdr && noAdr.checks.some(c => c.level === "bad" && c.name === "ADR certificate") ? "OK" : "FAIL");
console.log("  sorted desc:", rank.every((r, i) => i === 0 || rank[i-1].score >= r.score) ? "OK" : "FAIL");

console.log("\\n== compliance rows for the top candidate ==");
rank[0].checks.forEach(c => console.log("  [" + c.level.padEnd(4) + "] " + c.name.padEnd(16) + c.why + (c.fix ? "  -> " + c.fix : "")));

console.log("\\n== assign ripples ==");
const before = {
  onTrip: S.by("on_trip"), avail: S.by("available"),
  v2: Store.state.vehicles.find(v => v.id === "v2").status,
  v5: Store.state.vehicles.find(v => v.id === "v5").status,
  gvms: S.tripByRef("TR-4471").declarations.gvms,
};
A.assignVehicle("TR-4471", "v5");
const t = S.tripByRef("TR-4471");
const after = {
  onTrip: S.by("on_trip"), avail: S.by("available"),
  v2: Store.state.vehicles.find(v => v.id === "v2").status,
  v5: Store.state.vehicles.find(v => v.id === "v5").status,
};
ck("v2 released", before.v2 + " -> " + after.v2, "on_trip -> available");
ck("v5 takes the trip", before.v5 + " -> " + after.v5, "available -> on_trip");
ck("U-ETDS", t.declarations.uetds, "filed");
ck("GVMS drafted", before.gvms + " -> " + t.declarations.gvms, "missing -> draft");
ck("trip cost EUR", t.cost.total);
ck("CO2e kg", t.co2eKg);
ck("on trip unchanged", after.onTrip, before.onTrip);
ck("available unchanged", after.avail, before.avail);

console.log("\\n== undo ==");
ck("can undo", Store.canUndo(), "true");
const label = A.undo();
ck("undo label", label, "Assign TR-4471");
ck("v2 back", Store.state.vehicles.find(v => v.id === "v2").status, "on_trip");
ck("v5 back", Store.state.vehicles.find(v => v.id === "v5").status, "available");
ck("GVMS back", S.tripByRef("TR-4471").declarations.gvms, "missing");

console.log("\\n== other actions ==");
const exp = Store.state.vehicles.find(v => v.docs.state === "expired");
A.renewDocument(exp.id);
ck("renew clears expiry", Store.state.vehicles.find(v => v.id === exp.id).docs.state, "valid");
ck("expired count drops", S.docsExpired(), 2);
A.undo();
ck("undo restores expiry", S.docsExpired(), 3);

const od = Store.state.vehicles.find(v => v.maint.state === "overdue");
A.scheduleMaintenance(od.id);
ck("schedule clears overdue", S.maintOverdue(), 2);
A.undo();
ck("undo restores overdue", S.maintOverdue(), 3);

const kmBefore = Store.state.vehicles.find(v => v.status === "on_trip").km;
A.advanceSimulation();
ck("simulation moves km", Store.state.vehicles.find(v => v.status === "on_trip").km > kmBefore, "true");
A.undo();
`;

let listeners = 0;
global.Store = undefined;
try {
  eval(core + "\nStore.subscribe(() => { listeners++; });\n" + probe);
  console.log("\n== store notified subscribers ==");
  console.log("  emit count:", listeners, listeners > 0 ? "OK" : "FAIL");
} catch (e) {
  console.error("\nHATA:", e.message, "\n", e.stack.split("\n").slice(0, 4).join("\n"));
  process.exit(1);
}
