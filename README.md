# Tyria Ledger

Desktop Guild Wars 2 Trading Post and crafting companion for macOS and Windows.

## What is in this first build

- Electron desktop shell with React and Vite.
- Live Trading Post catalog from the official GW2 API.
- Item detail view with current buy/sell listings, direct recipes, ingredient cost, and GW2 Wiki guide link/extract.
- Local GW2 API key storage through Electron's main process.
- Account analysis for craft profit and legendary readiness using account materials, bank, inventory, recipes, and achievements when the key scopes permit it.
- Persistent Goals & Projects with account-owned progress, recipe requirements, vendors, route preferences, and recursive acquisition maps.
- Build goals that compare MetaBattle equipment recommendations against a selected character and equipment template.
- A personal Daily Planner and configurable Meta Train schedule with copyable in-game waypoints.
- Local Trading Post price history, threshold alerts, and native desktop notifications.
- Named Farming Tracker sessions with saved value, duration, gold-per-hour, and drop history.
- A standalone Acquisition Explorer for Trading Post, crafting, Mystic Forge, vendor, and account-owned routes.

The official API does not provide global historical Trading Post price charts. The app is structured so a local recorder or third-party historical data provider can be added later.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run package
```

Use `npm run dist:mac` on macOS and `npm run dist:win` on Windows to create installer artifacts.

## GitHub releases

The app checks the latest GitHub release at startup. Publish release artifacts with:

```bash
gh auth login
npm run release:github
```

Use `npm run release:github:dry` to verify the files before uploading. The release script uploads the macOS Intel, macOS Apple Silicon, Windows installer, Windows portable build, updater metadata, and blockmap files from `release/`.

To publish to a repo that is not the current `origin`, pass the target explicitly:

```bash
node scripts/release-github.cjs --repo=YOUR_ACCOUNT/Tyria-Ledger
```

The script refuses to release from a dirty worktree so the GitHub tag matches the shipped build.
