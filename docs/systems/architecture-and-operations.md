# Architecture, API and operations

Reviewed 2026-09-12. This repository is a Sites-hosted browser game with a custom Worker and D1 persistence. Runtime baseline and verification scope are in [current state](../current-state.md).

## Source boundaries

| Layer | Entry points | Responsibility |
| --- | --- | --- |
| Browser entry | public/index.html, game.js | Assets, Phaser scene, solo lifecycle and overlays |
| Shared gameplay | public/rules.mjs, stats.mjs, arsenal.mjs | Item rules and reusable combat calculations |
| Co-op | public/coop-model.mjs, coop-ui.mjs, coop-network.mjs | Host simulation, display and transport |
| Persistence client | public/progression.mjs, guest.mjs | Account delivery, retry queue and local guest data |
| Worker routing | server/worker.mjs | API dispatch, index and asset responses |
| Backend | server/api.mjs, coop.mjs, layouts.mjs | Profile/results, room relay and decor publication |
| Database | db/schema.ts, drizzle/ | Typed schema and ordered migrations |
| Build/hosting | build.mjs, package.json, .openai/hosting.json | Bundle and Site configuration |

The browser imports modules directly; the Worker is bundled by esbuild as ES2022 ESM. `build.mjs` recreates `dist`, copies public assets and hosting/migration metadata, and checks the Worker fetch export. HTML and JavaScript/CSS are served with no-cache headers. `/favicon.ico` redirects to the SVG. API exceptions return a generic retryable 503 and log the server error.

## API contracts

| Route | Method | Contract |
| --- | --- | --- |
| /api/profile | GET | Authenticated profile plus derived achievements/chart unlocks |
| /api/purchase | POST | upgrade ID and current rank; atomic balance/rank update; conflict 409 |
| /api/run/start | POST | runId, mapId, character; validate unlocks and pin bonus snapshot |
| /api/run/checkpoint | POST | Cumulative gold, elapsed, kills, finished, optional charted/seals/claims/kingDefeated |
| /api/coop/create, join | POST | Room creation or atomic guest claim; return role capability |
| /api/coop/lobby | POST | Selection/readiness/launch with room token and lobby revision |
| /api/coop/exchange, leave | POST | Sequenced state/input/signaling or close room |
| /api/layouts/access | GET | Whether current dispatched identity is the owner |
| /api/layouts | GET | Latest immutable bundle or exact ?version=N; version 0 means base layout |
| /api/layouts/draft | GET / POST | Owner per-map draft and revision-checked replacement |
| /api/layouts/publish | POST | Owner append of saved revision into a new immutable bundle |

Read the handlers for exact request fields before changing a client. Profile writes require same-origin JSON and have a 4,096-character request limit. Checkpoints require integer totals, elapsed ≤7,200, kills ≤1,000,000, gold ≤100,000, elapsed within wall-clock start +30 seconds and gold ≤200 + elapsed×8. Seal/claim/King evidence has section-specific checks. These are consistency bounds, not server replay of gameplay. D1 batches atomically credit only new cumulative gold and advance stored totals. Closed runs cannot be credited again.

Sites-dispatched authenticated email is normalized and SHA-256 hashed for account keys, with dispatched user ID as fallback. Never accept identity from request bodies, URLs or browser storage. Private layout endpoints independently enforce owner identity. Co-op room capabilities do not authorize another player's account writes.

## Persistent tables

| Table | Key | Stored responsibility |
| --- | --- | --- |
| profiles | user_id | Spendable coins, four upgrade ranks, section unlock flags |
| runs | id, indexed user_id | Owner, section, cumulative results, chart/seal/claim/King evidence, bonus snapshot, timestamps, closed/victory flags |
| coop_rooms | code, indexed expires_at | Role tokens/configs, current state/input/signals, sequence and presence timestamps |
| layout_drafts | map_id | Revision, JSON patches, update time |
| layout_versions | incrementing id | Immutable combined JSON bundle and creation time |

Append migrations; do not rewrite applied history. Published layout versions must remain addressable for active parties. Results do not contain resumable inventory or full simulation state. No automated backup/restore drill or migration rollback guarantee was established by this review.

## Commands and publication

`npm test` runs `node --test tests/*.test.mjs`; `npm run build` runs the build script. `npm run db:generate` uses drizzle-kit. Dependencies are pinned through the lockfile. Use the Sites building/hosting instructions when making a real release, preserve the existing Site identity/audience, and verify build/deployment results. Git source commits and live deployments are distinct: documentation-only changes do not need a deploy or schema migration.

Operational checks: authenticated/guest profile behavior, asset-load failures, Worker errors, stale room cleanup, two-device connectivity, and version pinning. Never paste room tokens, write credentials or account headers into docs/log excerpts. See [review workflow](../review-workflow.md) for proportional verification and handoff rules.
