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
