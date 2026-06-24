# Tyria Ledger

Desktop Guild Wars 2 Trading Post and crafting companion for macOS and Windows.

## What is in this first build

- Electron desktop shell with React and Vite.
- Live Trading Post catalog from the official GW2 API.
- Item detail view with current buy/sell listings, direct recipes, ingredient cost, and GW2 Wiki guide link/extract.
- Local GW2 API key storage through Electron's main process.
- Account analysis for craft profit and legendary readiness using account materials, bank, inventory, recipes, and achievements when the key scopes permit it.

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
