# Modaltrans — Fleet Management (concept)

Modaltrans lists **Fleet Management** on its site as *coming soon*. This is a working
concept for that module: pick an unassigned road leg, pick a truck, clear the compliance
blockers, and commit — in one step that files the declaration, costs the trip and tells
the customer.

> Unofficial concept work, not a Modaltrans product. Every record in it is fictional.

## Run it

```bash
npm run dev        # http://localhost:5173 — reloads when the source changes
npm run build      # writes public/index.html
npm run preview    # build, then serve public/ exactly as it deploys
```

No dependencies. Node 18+.

## Deploy

Vercel, zero configuration beyond `vercel.json`:

```bash
vercel            # preview
vercel --prod     # production
```

Or connect the GitHub repo in the Vercel dashboard — it picks up `buildCommand`
and `outputDirectory` from `vercel.json`.

Only `public/` is published. The research and design documents stay in the repo.

## Layout

| Path | What |
|---|---|
| `fleet-management-demo.html` | The whole app — one file, vanilla JS, no framework |
| `scripts/build.mjs` | Wraps the fragment into a complete HTML document |
| `scripts/dev-server.mjs` | Zero-dependency static server with live reload |
| `public/` | Build output, git-ignored |

### Documents

| File | What |
|---|---|
| [`modaltrans-knowledge.md`](modaltrans-knowledge.md) | Company and market analysis |
| [`fleet-management-concept.md`](fleet-management-concept.md) | Product decisions, scope, data model |
| [`design-system-brief.md`](design-system-brief.md) | What was asked of the design system |
| [`phase-by-phase-implementation-plan.md`](phase-by-phase-implementation-plan.md) | Build plan and progress |

## Why one file

The demo has no backend. State lives in a small store with an undo history, and every
number on screen is computed from the same seeded dataset rather than typed in — fleet
utilisation, cost per km, documents expiring, vehicles needing attention. A framework
and a build pipeline would add moving parts without adding anything the demo needs.

The source is written as an Artifact-style fragment (no `<!doctype>`, no `<head>`), so
it can also be published directly as a Claude Artifact. `npm run build` wraps it into a
complete document for the web.

## Design system

Colour, type, spacing and density come from a Claude Design project built for this work,
and the tokens trace back to Modaltrans's own site — brand `oklch(0.6399 0.189 32.51)`,
the cool neutral ramp, General Sans. Components read semantic roles only
(`--accent`, `--bad-fg`, `--surface-2`), never the raw scales; a check in the repo
enforces that.
