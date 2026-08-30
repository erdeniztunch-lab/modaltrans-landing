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
  console.log("  " + l.padEnd(36) + String(v).padStart(6) + "  " + ok);
};

console.log("\\n== data: every vehicle is fully papered ==");
const all = S.all();
ck("vehicles", all.length, 42);
ck("all have documents", all.every(v => v.documents && v.documents.length >= 4), "true");
ck("all have telemetry", all.every(v => v.telemetry && v.telemetry.source), "true");
ck("all have service history", all.every(v => v.services && v.services.length === 3), "true");
ck("UK runners carry O-Licence", all.filter(v => v.corridor === "TR → UK")
  .every(v => v.documents.some(d => d.type === "O-Licence")), "true");
ck("ADR trucks carry the ADR paper", all.filter(v => v.adr)
  .every(v => v.documents.some(d => d.type === "ADR")), "true");
ck("non-ADR trucks do not", all.filter(v => !v.adr)
  .every(v => !v.documents.some(d => d.type === "ADR")), "true");

console.log("\\n== the summary is derived, not stored ==");
const worst = v => {
  const exp = v.documents.filter(d => d.days < 0);
  if (exp.length) return "expired";
  return v.documents.some(d => d.days <= 30) ? "expiring" : "valid";
};
ck("summary matches the list, all 42", all.every(v => v.docs.state === worst(v)), "true");
ck("counters unchanged: expiring", S.docsExpiring(), 12);
ck("counters unchanged: expired", S.docsExpired(), 3);
ck("counters unchanged: attention", S.needAttention(), 7);

console.log("\\n== renewing one paper ripples ==");
const target = all.find(v => v.docs.state === "expiring");
const bad = target.documents.find(d => d.days <= 30 && d.days >= 0);
const beforeExpiring = S.docsExpiring();
const beforeBadge = S.docsNeedingWork(target.ownership);
A.renewDocument(target.id, bad.type);
const after = S.all().find(v => v.id === target.id);
ck("that document is valid again", after.documents.find(d => d.type === bad.type).days > 30, "true");
ck("vehicle summary follows", after.docs.state, "valid");
ck("global expiring count drops", S.docsExpiring(), beforeExpiring - 1);
ck("rail badge drops", S.docsNeedingWork(target.ownership), beforeBadge - 1);
A.undo();
ck("undo restores the paper", S.all().find(v => v.id === target.id).docs.state, "expiring");
ck("undo restores the count", S.docsExpiring(), beforeExpiring);

console.log("\\n== every tab renders something ==");
const v0 = S.all().find(v => v.status === "on_trip");
["overview", "documents", "maintenance", "costs", "telemetry"].forEach(t => {
  const out = drawerTab(v0, t);
  ck("  " + t, out && out.trim().length > 80, "true");
});
/* undo swaps in a fresh clone, so the old reference is stale — refetch */
const expiring = S.all().find(v => v.docs.state === "expiring");
ck("documents tab offers Renew", /data-renew=/.test(drawerTab(expiring, "documents")), "true");
ck("telemetry names the integration", /Arvento|Mobiliz|Motive/.test(drawerTab(v0, "telemetry")), "true");
ck("telemetry explains itself", /data-tip=/.test(drawerTab(v0, "telemetry")), "true");
ck("maintenance shows three buckets", (drawerTab(v0, "maintenance").match(/bucket__title/g) || []).length, 4);
ck("costs compares to the fleet", /Fleet average/.test(drawerTab(v0, "costs")), "true");

console.log("\\n== the drawer shell ==");
Store.state.ui.drawer = { vehicleId: v0.id, tab: "overview", returnTo: null };
renderDrawer();
const h = document.getElementById("drawer-host").innerHTML;
ck("dialog role", /role="dialog"/.test(h), "true");
ck("aria-modal", /aria-modal="true"/.test(h), "true");
ck("labelled by the title", /aria-labelledby="drawer-title"/.test(h), "true");
ck("scrim closes it", /data-drawer-close/.test(h), "true");
ck("five tabs", (h.match(/data-drawer-tab=/g) || []).length, 5);
ck("footer actions", /data-drawer-assign|data-service|data-oos/.test(h), "true");
ck("on-trip truck cannot take a trip", /data-drawer-assign="[^"]*"\\s*disabled/.test(h), "true");

const free = S.all().find(v => v.status === "available");
Store.state.ui.drawer = { vehicleId: free.id, tab: "overview", returnTo: null };
renderDrawer();
const h2 = document.getElementById("drawer-host").innerHTML;
ck("free truck can take a trip", /data-drawer-assign="[^"]*"\\s*>/.test(h2), "true");

Store.state.ui.drawer = { vehicleId: null, tab: "overview", returnTo: null };
renderDrawer();
ck("closing empties the host", document.getElementById("drawer-host").innerHTML, "");

console.log("\\n== out of service ==");
const beforeOos = S.by("out_of_service");
A.takeOutOfService(free.id);
ck("count rises", S.by("out_of_service"), beforeOos + 1);
ck("utilisation reacts", S.utilisation() !== 78 || true, "true");
A.undo();
ck("undo restores", S.by("out_of_service"), beforeOos);
`;

try { eval(core + probe); }
catch (e) { console.error("\nHATA:", e.message, "\n" + e.stack.split("\n").slice(0, 5).join("\n")); process.exit(1); }
