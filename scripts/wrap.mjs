/**
 * The demo is authored as an Artifact-style fragment: <title>, <style>, markup,
 * <script> — no <!doctype>, no <html>, no <head>. That is what the Artifact
 * runtime expects, and it stays publishable as-is.
 *
 * A real deployment needs a complete document, otherwise the browser renders in
 * quirks mode. This lifts the title and styles into a proper <head> and leaves
 * the rest in <body>.
 */

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E" +
  "%3Ctext y='.9em' font-size='90'%3E%F0%9F%9A%9A%3C/text%3E%3C/svg%3E";

const DESCRIPTION =
  "A concept for the Fleet Management module Modaltrans lists as coming soon: " +
  "assign a truck to a road leg, clear the compliance blockers, file U-ETDS and cost the trip in one step.";

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

export function wrap(fragment, { dev = false } = {}) {
  const title = (fragment.match(/<title>([\s\S]*?)<\/title>/) || [, "Modaltrans Fleet"])[1].trim();

  const styles = [];
  let body = fragment
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<style>[\s\S]*?<\/style>\s*/gi, m => { styles.push(m); return ""; });

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${DESCRIPTION}">
<meta name="color-scheme" content="light dark">
<meta name="robots" content="noindex">
<link rel="icon" href="${FAVICON}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${DESCRIPTION}">
${styles.join("\n")}
</head>
<body>
${body.trim()}
${dev ? LIVE_RELOAD : ""}
</body>
</html>
`;
}
