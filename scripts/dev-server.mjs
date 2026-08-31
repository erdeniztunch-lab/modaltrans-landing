import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";
import { wrap } from "./wrap.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const LANDING = join(root, "landing.html");
const DEMO = join(root, "fleet-management-demo.html");
const DIST = join(root, "public");

const dist = process.argv.includes("--dist");
const port = Number(process.env.PORT) || 5173;

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".ttf": "font/ttf",
};

/** In dev the landing borrows the demo's embedded font, exactly as the build does. */
async function landingFragment() {
  const demo = await readFile(DEMO, "utf8");
  const face = demo.match(/@font-face\{[\s\S]*?\}/);
  const src = await readFile(LANDING, "utf8");
  return src.replace("/*__FONT__*/", face ? face[0] : "");
}

const isDemo = url => url === "/demo" || url === "/demo/" || url === "/demo/index.html";
const isRoot = url => url === "/" || url === "/index.html";

const server = createServer(async (req, res) => {
  const url = (req.url || "/").split("?")[0];

  /* The page polls this; when either source changes it reloads itself. */
  if (url === "/__v") {
    const [a, b] = await Promise.all([stat(LANDING), stat(DEMO)]);
    res.writeHead(200, { "content-type": "text/plain", "cache-control": "no-store" });
    return res.end(String(a.mtimeMs + b.mtimeMs));
  }

  try {
    if (isRoot(url) || isDemo(url)) {
      const wantsDemo = isDemo(url);
      let html;
      if (dist) {
        html = await readFile(join(DIST, wantsDemo ? "demo/index.html" : "index.html"), "utf8");
      } else {
        const fragment = wantsDemo ? await readFile(DEMO, "utf8") : await landingFragment();
        html = wrap(fragment, { dev: true, colorScheme: wantsDemo ? "light dark" : "light" });
        /* the artifact URLs only make sense once published; on the web the two
           pages are siblings, so each one's link to the other is rewritten */
        html = wantsDemo
          ? html.replace(
              /(<a[^>]*\bdata-landing-link\b[^>]*\bhref=")https:\/\/claude\.ai\/code\/artifact\/[0-9a-f-]+(")/g, "$1/$2")
          : html.replace(
              /(<a[^>]*\bdata-demo-link\b[^>]*\bhref=")https:\/\/claude\.ai\/code\/artifact\/[0-9a-f-]+(")/g, "$1/demo/$2");
      }
      res.writeHead(200, { "content-type": MIME[".html"], "cache-control": "no-store" });
      return res.end(html);
    }

    const file = join(dist ? DIST : root, url);
    if (!file.startsWith(dist ? DIST : root)) throw new Error("outside root");
    const body = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": MIME[".html"] });
    res.end('<h1>404</h1><p><a href="/">Landing</a> · <a href="/demo/">Demo</a></p>');
  }
});

server.listen(port, () => {
  console.log(`\n  Fleet Management — ${dist ? "preview of public/" : "dev"}\n`);
  console.log(`  http://localhost:${port}/        landing`);
  console.log(`  http://localhost:${port}/demo/   app\n`);
  if (!dist) console.log("  Editing either source reloads the page.\n");
});
