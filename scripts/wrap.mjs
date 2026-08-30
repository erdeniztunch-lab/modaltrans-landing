/**
 * Both pages are authored as Artifact-style fragments: <title>, <style>, markup,
 * <script> — no <!doctype>, no <html>, no <head>. That is what the Artifact
 * runtime expects, and it keeps them publishable as-is.
 *
 * A real deployment needs a complete document, otherwise the browser renders in
 * quirks mode. This lifts the title, links and styles into a proper <head> and
 * leaves the rest in <body>.
 */

const emojiFavicon = glyph =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${glyph}</text></svg>`
  );

/** Injected only by `npm run dev` — polls for changes and reloads. */
const LIVE_RELOAD = `
<script>
(() => {
  let last = null;
  const tick = async () => {
    try {
      const v = await (await fetch("/__v", { cache: "no-store" })).text();
      if (last !== null && v !== last) return location.reload();
      last = v;
    } catch {}
  };
  setInterval(tick, 700);
  tick();
})();
</script>`;

export function wrap(fragment, { dev = false, description = "", favicon = "🚚", colorScheme = "light dark" } = {}) {
  const title = (fragment.match(/<title>([\s\S]*?)<\/title>/) || [, "Fleet Management"])[1].trim();

  /* <link> and <style> belong in the head; everything else is the body. */
  const head = [];
  const body = fragment
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<link\b[^>]*>\s*/gi, m => { head.push(m); return ""; })
    .replace(/<style>[\s\S]*?<\/style>\s*/gi, m => { head.push(m); return ""; });

  const esc = s => String(s).replace(/"/g, "&quot;");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${esc(description)}">
<meta name="color-scheme" content="${colorScheme}">
<meta name="robots" content="noindex">
<link rel="icon" href="${emojiFavicon(favicon)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${head.join("\n")}
</head>
<body>
${body.trim()}
${dev ? LIVE_RELOAD : ""}
</body>
</html>
`;
}
