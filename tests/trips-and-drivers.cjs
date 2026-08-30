const fs = require("fs");
const P = require("path").join(__dirname, "..", "fleet-management-demo.html");
const html = fs.readFileSync(P, "utf8");
const js = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
const core = js.slice(0, js.lastIndexOf("/* ====", js.indexOf("   EVENTS — one delegated")));

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

const probe = `
const ck = (l, v, e) => {
  const ok = e === undefined ? "" : (String(v) === String(e) ? "OK" : "FAIL (expected " + e + ")");
  console.log("  " + l.padEnd(38) + String(v).padStart(5) + "  " + ok);
};

console.log("\\n== trips: the buckets partition cleanly ==");
const all = S.trips();
const bucket = k => all.filter(t => tripBucket(t) === k).length;
const active = bucket("active"), unassigned = bucket("unassigned"),
      delayed = bucket("delayed"), completed = bucket("completed");
ck("trips total", all.length);
ck("active", active);
ck("unassigned", unassigned, 5);
ck("delayed", delayed, 3);
ck("completed", completed, 10);
ck("buckets sum to the total", active + unassigned + delayed + completed, all.length);
ck("no trip lands in two buckets", all.every(t => ["active","unassigned","delayed","completed"].includes(tripBucket(t))), "true");

console.log("\\n== every trip is real ==");
const assigned = all.filter(t => t.status !== "unassigned");
ck("assigned trips have a vehicle", assigned.every(t => S.all().some(v => v.id === t.vehicleId)), "true");
ck("assigned trips have a driver", assigned.every(t => t.driverId && S.drivers().some(d => d.id === t.driverId)), "true");
ck("completed trips are costed", all.filter(t => t.status === "completed").every(t => t.cost && t.cost.total > 0), "true");
ck("completed trips have CO2e", all.filter(t => t.status === "completed").every(t => t.co2eKg > 0), "true");
ck("every late trip says why", all.filter(t => t.delayed).every(t => t.delayReason && t.delayReason.length > 10), "true");
ck("unassigned trips have no vehicle", S.unassignedTrips().every(t => !t.vehicleId), "true");

/* regression guards: QA caught both of these */
const liveTrips = all.filter(t => t.status === "active");
const perV = {}; liveTrips.forEach(t => { perV[t.vehicleId] = (perV[t.vehicleId] || 0) + 1; });
ck("no truck runs two live trips", Object.values(perV).every(n => n === 1), "true");
const perD = {}; liveTrips.forEach(t => { if (t.driverId) perD[t.driverId] = (perD[t.driverId] || 0) + 1; });
ck("no driver runs two live trips", Object.values(perD).every(n => n === 1), "true");
ck("every on-trip truck has a trip", S.all().filter(v => v.status === "on_trip")
  .every(v => liveTrips.some(t => t.vehicleId === v.id)), "true");
ck("live trips match the on-trip count", liveTrips.length, S.by("on_trip"));

console.log("\\n== the chain follows the trip ==");
const doneTrip = all.find(t => t.status === "completed");
ck("completed chain is all done", chainFor(doneTrip).every(c => c[1] === "done"), "true");
const story = S.tripByRef("TR-4471");
ck("story trip still blocked at GVMS", chainFor(story)[4][1], "blocked");
ck("  ... and says why", chainFor(story)[4][3], "No reference yet");

console.log("\\n== declarations ==");
ck("fixed order", DECL_ORDER.join(","), "uetds,ncts,ens,gvms");
ck("every declaration has a gloss", DECL_ORDER.every(k => DECL_META[k].tip.length > 30), "true");
const domestic = all.find(t => t.corridor === "TR → RO" && t.status === "completed") || all.find(t => t.declarations && t.declarations.gvms === "not_required");
ck("non-UK legs need no GVMS", domestic.declarations.gvms, "not_required");
const chipsHtml = declChips(story);
ck("four chips rendered", (chipsHtml.match(/class="chip/g) || []).length, 4);
ck("not_required uses the quiet variant", /chip--quiet/.test(declChips(domestic)), "true");
ck("chips carry tooltips", (chipsHtml.match(/data-tip=/g) || []).length, 4);
ck("U-ETDS is first", chipsHtml.indexOf("U-ETDS") < chipsHtml.indexOf("GVMS"), "true");

console.log("\\n== drivers ==");
const drivers = S.drivers();
ck("all have licences", drivers.every(d => d.licences && d.licences.length >= 1), "true");
ck("all have a nationality", drivers.every(d => d.nationality), "true");
ck("ADR drivers carry the ADR card", drivers.filter(d => d.adr).every(d => d.licences.some(l => l.type === "ADR")), "true");
ck("near the AETR limit", S.driversNearLimit(), 2);
/* cards fall due naturally across the roster; one is forced well past the line */
ck("tacho overdue (>28d)", drivers.filter(d => d.tachoDaysAgo > 28).length > 0, "true");
ck("  worst offender", Math.max(...drivers.map(d => d.tachoDaysAgo)) >= 34, "true");
ck("hours threshold: 45m is bad", hoursSem(45), "bad");
ck("hours threshold: 90m is warn", hoursSem(90), "warn");
ck("hours threshold: 400m is ok", hoursSem(400), "ok");
ck("tacho 34d is bad", tachoSem(34), "bad");
ck("tacho 26d is warn", tachoSem(26), "warn");
ck("tacho 5d is ok", tachoSem(5), "ok");

console.log("\\n== views render, and rows lead somewhere ==");
["active", "unassigned", "delayed", "completed"].forEach(t => {
  Store.state.ui.tripTab = t;
  const h = views.trips();
  ck("  trips/" + t, h.length > 600, "true");
});
Store.state.ui.tripTab = "active";
const tripsHtml = views.trips();
ck("rows open a vehicle", (tripsHtml.match(/data-triprow=/g) || []).length > 0, "true");
ck("glossary present", /glossary/.test(tripsHtml), "true");
ck("delayed tab shows the reason", /triprow2__delay/.test((Store.state.ui.tripTab = "delayed", views.trips())), "true");
Store.state.ui.tripTab = "unassigned";
ck("unassigned rows are not clickable", !/data-triprow=/.test(views.trips()), "true");

const driversHtml = views.drivers();
ck("drivers view renders", driversHtml.length > 600, "true");
ck("  hours bars", (driversHtml.match(/hoursbar/g) || []).length > 5, "true");
ck("  bench section", /On the bench/.test(driversHtml), "true");
ck("  on-duty rows open a vehicle", (driversHtml.match(/data-driverrow=/g) || []).length > 5, "true");
ck("  bench rows are inert", /class="is-idle"/.test(driversHtml), "true");

console.log("\\n== Overview picked up the late runs ==");
const late = S.attention().find(a => a.key === "late");
ck("attention row exists", !!late, "true");
ck("counts the delayed trips", late.count, 3);
ck("six attention rows", S.attention().length, 6);
`;

try { eval(core + probe); }
catch (e) { console.error("\nHATA:", e.message, "\n" + e.stack.split("\n").slice(0, 5).join("\n")); process.exit(1); }
