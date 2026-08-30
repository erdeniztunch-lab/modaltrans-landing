const fs = require("fs");
const P = require("path").join(__dirname, "..", "fleet-management-demo.html");
const html = fs.readFileSync(P, "utf8");
const js = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
const core = js.slice(0, js.lastIndexOf("/* ====", js.indexOf("   EVENTS — one delegated")));

/* a DOM stub with enough surface for the tour to paint into */
const els = {};
const node = () => ({
  innerHTML: "", textContent: "", dataset: {}, hidden: true, style: {},
  setAttribute() {}, focus() {}, append() {}, remove() {},
  querySelector: () => null, querySelectorAll: () => [],
  getBoundingClientRect: () => ({ left: 40, top: 80, width: 300, height: 120, bottom: 200, right: 340 }),
  scrollIntoView() {}, contains: () => false, click() {},
});
global.addEventListener = () => {};
global.location = { hash: "" };
global.matchMedia = () => ({ matches: false });
global.localStorage = (() => { const m = {}; return { getItem: k => m[k] ?? null, setItem: (k, v) => { m[k] = String(v); } }; })();
global.setInterval = () => 1; global.clearInterval = () => {}; global.setTimeout = () => 1;
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = () => {};
global.innerHeight = 900; global.innerWidth = 1440;
global.document = {
  getElementById: id => (els[id] || (els[id] = node())),
  querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
  documentElement: { dataset: {} }, body: { style: {} },
  activeElement: { tagName: "BODY", dataset: {} },
  createElement: () => node(), title: "",
};
global.window = { scrollTo() {}, scrollY: 0 };

const probe = `
const ck = (l, v, e) => {
  const ok = e === undefined ? "" : (String(v) === String(e) ? "OK" : "FAIL (expected " + e + ")");
  console.log("  " + l.padEnd(42) + String(v).padStart(5) + "  " + ok);
};

console.log("\\n== the five steps ==");
ck("step count", TOUR.length, 5);
ck("every step has text", TOUR.every(s => typeof s.text === "function" && s.text().length > 15), "true");
ck("every step has a subtitle", TOUR.every(s => s.sub().length > 25), "true");
ck("every step names a target", TOUR.every(s => typeof s.target === "function" && s.target().length > 2), "true");
ck("every step drives the app", TOUR.every(s => typeof s.enter === "function"), "true");

console.log("\\n== copy comes from the data, not the keyboard ==");
const s1 = TOUR[0].text(), s2 = TOUR[1].text();
ck("step 1 quotes needAttention", s1.includes(String(S.needAttention())), "true");
ck("step 2 quotes unassigned", s2.includes(String(S.unassignedTrips().length)), "true");
/* move the data and the sentence must move with it */
const before1 = s1;
A.takeOutOfService(S.all().find(v => v.status === "available").id);
ck("attention rises", S.needAttention(), 8);
ck("sentence follows the data", TOUR[0].text() !== before1, "true");
ck("  ... and quotes the new number", TOUR[0].text().includes("8"), "true");
A.undo();
ck("back to where we were", TOUR[0].text(), before1);

console.log("\\n== step 3 finds the right truck by rule, not by id ==");
const leg = tourLeg();
ck("the leg carries dangerous goods", leg.adr, "true");
const blocked = tourBlocked(leg.ref);
ck("candidate has exactly one blocker", blocked.blockers, 1);
ck("and it is driver hours", blocked.checks.some(c => c.level === "bad" && c.name === "Driver hours"), "true");
ck("the truck itself is free", blocked.vehicle.status, "available");
ck("a fix is offered", blocked.checks.some(c => c.act && c.act.type === "swapDriver"), "true");
const alt = S.drivers().find(d => d.id === blocked.checks.find(c => c.act && c.act.type === "swapDriver").act.driverId);
ck("the suggested driver has the hours", alt.minutesLeft >= leg.legMin, "true");

console.log("\\n== step 4 really assigns, and it can be taken back ==");
const unBefore = S.unassignedTrips().length, histBefore = Store.history.length;
Tour.active = true; Tour.step = 3;
TOUR[3].enter();
ck("unassigned drops", S.unassignedTrips().length, unBefore - 1);
ck("U-ETDS filed", S.tripByRef(leg.ref).declarations.uetds, "filed");
ck("trip is costed", S.tripByRef(leg.ref).cost.total > 0, "true");
ck("carbon recorded", S.tripByRef(leg.ref).co2eKg > 0, "true");
ck("tour knows it committed", Tour.committed, "true");
ck("exactly one history entry", Store.history.length, histBefore + 1);
Tour.end(true);
ck("cleanup rolled it back", S.unassignedTrips().length, unBefore);
ck("history back to normal", Store.history.length, histBefore);
ck("committed flag cleared", Tour.committed, "false");
ck("tour is closed", Tour.active, "false");

console.log("\\n== Done keeps the work, Skip does not ==");
Tour.active = true; Tour.step = 3; TOUR[3].enter();
Tour.end(false);
ck("Done leaves the assignment standing", S.unassignedTrips().length, unBefore - 1);
A.undo();
ck("reset for the next check", S.unassignedTrips().length, unBefore);

console.log("\\n== the ticker is held during the tour ==");
Sim.running = true; Sim.timer = 1;
Tour.start();
ck("simulation paused", Sim.running, "false");
ck("it remembered the ticker was on", Tour.simWas, "true");
Tour.end(true);
ck("tour finished", Tour.active, "false");
Sim.stop();

console.log("\\n== the first-visit nudge shows once ==");
localStorage.setItem("mt-tour-seen", "");
ck("unseen to begin with", Tour.seen(), "false");
Tour.showNudge();
ck("nudge revealed", document.getElementById("tour-nudge").hidden, "false");
Tour.dismissNudge();
ck("dismissed", document.getElementById("tour-nudge").hidden, "true");
ck("and remembered", Tour.seen(), "true");
Tour.showNudge();
ck("stays hidden on the next visit", document.getElementById("tour-nudge").hidden, "true");

console.log("\\n== the coach mark itself ==");
Tour.start();
const h = document.getElementById("tour-host").innerHTML;
ck("spotlight drawn", /class="spot"/.test(h), "true");
ck("dialog role", /role="dialog"/.test(h), "true");
ck("announced politely", /aria-live="polite"/.test(h), "true");
ck("step counter", /1 \\/ 5/.test(h), "true");
ck("skip offered", /data-tour-act="skip"/.test(h), "true");
Tour.go(4);
const last = document.getElementById("tour-host").innerHTML;
ck("last step offers Done", /data-tour-act="done"/.test(last), "true");
ck("last step offers Replay", /data-tour-act="replay"/.test(last), "true");
ck("no Next on the last step", /data-tour-act="next"/.test(last), "false");
Tour.end(true);
ck("host emptied", document.getElementById("tour-host").innerHTML, "");
`;

try { eval(core + probe); }
catch (e) { console.error("\nHATA:", e.message, "\n" + e.stack.split("\n").slice(0, 5).join("\n")); process.exit(1); }
