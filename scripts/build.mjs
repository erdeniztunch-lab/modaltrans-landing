import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { wrap } from "./wrap.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "public");

let demoSrc = await readFile(join(root, "fleet-management-demo.html"), "utf8");
let landingSrc = await readFile(join(root, "landing.html"), "utf8");

/* Fail loudly rather than shipping a page with a placeholder in it. */
if (demoSrc.includes("__FONT__")) throw new Error("Font placeholder was never filled in the demo.");
const face = demoSrc.match(/@font-face\{[\s\S]*?\}/);
if (!face) throw new Error("General Sans is missing; the build would ship a fallback font.");

/* One copy of the font, one source of truth. The landing page carries a
   placeholder so the base64 never has to be duplicated by hand. */
if (!landingSrc.includes("/*__FONT__*/")) throw new Error("landing.html has no font placeholder.");
landingSrc = landingSrc.replace("/*__FONT__*/", face[0]);

/* On the web the demo is a sibling directory; in an Artifact it is a URL.
   The source keeps the URL so it stays publishable; the build rewrites it. */
const before = (landingSrc.match(/https:\/\/claude\.ai\/code\/artifact\/[0-9a-f-]+/g) || []).length;
landingSrc = landingSrc.replace(
  /(<a[^>]*\bdata-demo-link\b[^>]*\bhref=")https:\/\/claude\.ai\/code\/artifact\/[0-9a-f-]+(")/g,
  "$1/demo/$2"
);
const after = (landingSrc.match(/https:\/\/claude\.ai\/code\/artifact\/[0-9a-f-]+/g) || []).length;
if (before === 0) throw new Error("No demo link found on the landing page.");
if (after !== 0) throw new Error(`${after} demo link(s) still point at an artifact URL.`);

/* And the same in the other direction: the demo's way back to the landing. */
const backBefore = (demoSrc.match(/data-landing-link/g) || []).length;
demoSrc = demoSrc.replace(
  /(<a[^>]*\bdata-landing-link\b[^>]*\bhref=")https:\/\/claude\.ai\/code\/artifact\/[0-9a-f-]+(")/g,
  "$1/$2"
);
const backAfter = (demoSrc.match(/https:\/\/claude\.ai\/code\/artifact\/[0-9a-f-]+/g) || []).length;
if (backBefore === 0) throw new Error("The demo has no way back to the landing page.");
if (backAfter !== 0) throw new Error(`${backAfter} link(s) in the demo still point at an artifact URL.`);

await rm(OUT, { recursive: true, force: true });
await mkdir(join(OUT, "demo"), { recursive: true });

/* The landing page commits to a single light palette; the app follows the
   viewer's theme. Saying so in the head stops the browser painting the wrong
   ground behind form controls and scrollbars. */
await writeFile(join(OUT, "index.html"), wrap(landingSrc, {
  favicon: "🚚",
  colorScheme: "light",
  description:
    "A working concept for the Fleet Management module Modaltrans lists as coming soon: " +
    "check whether a truck can legally take the load, then file the declaration, cost the trip " +
    "and update the customer in one confirmation.",
}), "utf8");

await writeFile(join(OUT, "demo", "index.html"), wrap(demoSrc, {
  favicon: "🚚",
  description:
    "Assign a truck to a road leg, clear the compliance blockers, file U-ETDS and cost the trip in one step.",
}), "utf8");

/* Only public/ is published, so the research documents stay in the repo. */
await writeFile(join(OUT, "robots.txt"), "User-agent: *\nDisallow: /\n", "utf8");

const kb = async p => ((await readFile(p)).length / 1024).toFixed(0) + " KB";
console.log(`build  public/index.html       ${await kb(join(OUT, "index.html"))}   landing`);
console.log(`build  public/demo/index.html  ${await kb(join(OUT, "demo", "index.html"))}   app`);
