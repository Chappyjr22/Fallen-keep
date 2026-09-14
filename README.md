# Fallen Keep

Current Fallen Keep source snapshot, labeled **v7** for this GitHub handoff. No gameplay redesign or refactoring is included.

The verified ChatGPT Site source version is **72**, not 7. This snapshot preserves live source commit `8f13b3b47fb9c34e24157dea80c46d9d978cfa6f`, verified on 2026-09-14.

Live game: https://fallen-keep.jacobchapman3.chatgpt.site

## Contents

Complete Phaser game and bundled Phaser license, artwork/audio, UI, maps, equipment and transformations, progression and saves, solo/co-op systems, server API, database schema/migrations, tests, documentation, and package/build configuration. No production player data, credentials, dependencies, or generated build output is included.

## Local use

Requires Node.js 20.19+ (or 22.12+) and npm.

```sh
npm ci
npm run dev
```

Vite serves the browser game for local guest/solo preview. It does not provide the production account API or co-op backend.

```sh
npm test
npm run build
```

Build output contains static assets in `dist/client` and a Cloudflare-compatible Worker in `dist/server/index.js`. Full account saves and online co-op require the Worker, a D1 `DB` binding, checked-in Drizzle migrations, and the trusted identity integration currently supplied by ChatGPT Sites. Copying this source to GitHub does not migrate that hosting or database. `.openai/hosting.json` retains non-secret Site configuration needed by the build.

Start with [documentation](docs/README.md) and [architecture/operations](docs/systems/architecture-and-operations.md). Historical documents describe their recorded checkpoints; runtime source is authoritative.
