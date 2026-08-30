import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { wrap } from "./wrap.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "fleet-management-demo.html");
const OUT = join(root, "public");

const fragment = await readFile(SRC, "utf8");

/* Fail loudly rather than shipping a page with a placeholder in it. */
if (fragment.includes("__FONT__")) throw new Error("Font placeholder was never filled — run the font injection step.");
if (!fragment.includes("@font-face")) throw new Error("General Sans is missing; the build would ship a fallback font.");

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, "index.html"), wrap(fragment), "utf8");

/* Keep the docs out of the deployment: only public/ is published. */
await writeFile(join(OUT, "robots.txt"), "User-agent: *\nDisallow: /\n", "utf8");

const kb = n => (n / 1024).toFixed(0) + " KB";
console.log(`build  public/index.html  ${kb(Buffer.byteLength(await readFile(join(OUT, "index.html"))))}`);
