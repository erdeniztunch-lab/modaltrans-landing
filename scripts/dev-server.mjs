import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";
import { wrap } from "./wrap.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "fleet-management-demo.html");
const DIST = join(root, "public");

const dist = process.argv.includes("--dist");
const port = Number(process.env.PORT) || 5173;

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".ttf": "font/ttf",
};

const server = createServer(async (req, res) => {
  const url = (req.url || "/").split("?")[0];

  /* The page polls this; when the mtime changes it reloads itself. */
  if (url === "/__v") {
    const { mtimeMs } = await stat(dist ? join(DIST, "index.html") : SRC);
    res.writeHead(200, { "content-type": "text/plain", "cache-control": "no-store" });
    return res.end(String(mtimeMs));
  }

  try {
    if (url === "/" || url === "/index.html") {
      const html = dist
        ? await readFile(join(DIST, "index.html"), "utf8")
        : wrap(await readFile(SRC, "utf8"), { dev: true });
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
    res.end("<h1>404</h1><p>Try <a href='/'>/</a>.</p>");
  }
});

server.listen(port, () => {
  console.log(`\n  Modaltrans Fleet — ${dist ? "preview of public/" : "dev"}\n`);
  console.log(`  http://localhost:${port}\n`);
  if (!dist) console.log("  Editing fleet-management-demo.html reloads the page.\n");
});
