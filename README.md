# LHANA

A responsive, standalone redesign for LHANA, a family-owned interior design studio in Houston, Texas.

## Preview locally

Open `index.html` in a browser, or serve the repository with any static file server. The public pages keep their current HTML copy and portfolio data as a fallback; live content refresh and the admin editor require the Cloudflare Worker.

The all-projects gallery is at `projects/index.html`. Each project opens a detail page with its own photo gallery. Portfolio photographs are served from LHANA's existing Squarespace image library.

## Private site editor

The `/admin` editor manages homepage and contact copy, project details, homepage highlights, and project photography. Changes are stored in a dedicated LHANA D1 database and appear on public pages through `/api/content`. New photo uploads are stored in a dedicated R2 bucket. Admin pages and write APIs require Cloudflare Access; the Worker also validates the Access JWT before accepting changes.

This repository must use its **own** D1 database and R2 bucket. Do not copy Master’s database ID or bucket binding. To configure the service:

1. Install dependencies with `npm install`.
2. Create a D1 database named `lhana-content` and an R2 bucket named `lhana-gallery`.
3. Put the new D1 database ID in `wrangler.jsonc`. Apply `migrations/0001_lhana_content.sql` and then `migrations/0002_seed_lhana_projects.sql` to that database:
   `npx wrangler d1 execute lhana-content --remote --file=migrations/0001_lhana_content.sql`
   `npx wrangler d1 execute lhana-content --remote --file=migrations/0002_seed_lhana_projects.sql`
4. Create a Cloudflare Access self-hosted application for `lhana.liemvora.cc`, protecting `/admin*` and `/api/admin*`, and add an allow policy for the studio's administrator. Keep `ACCESS_TEAM_DOMAIN` aligned with the Access team and replace `ACCESS_AUD` with this application's audience tag.
5. Configure the proxied custom domain route in Cloudflare. `wrangler.jsonc` routes `lhana.liemvora.cc/*` through the Worker; the Workers.dev and preview URLs remain disabled.
6. Deploy with `npm run deploy`. The deploy script checks for the required D1 and Access values before publishing.

`npm run dev` starts a local Worker preview after building its static assets. The local database can be initialized with the same two migration files using `npx wrangler d1 execute lhana-content --local --file=...`. Cloudflare Access still protects `/admin` locally; use a deployed Access-protected environment to test editor sign-in and writes.
