# x-Travel Guide

x-Travel Guide now has two complementary editions.

## 1. Static GitHub Pages demo

The existing `index.html`, `app.js`, and `styles.css` turn three answers into a polished sample itinerary in the visitor's browser. This edition makes no OpenAI requests, needs no account or key, stores drafts only in `localStorage`, and can be hosted on GitHub Pages. Its optional live weather uses Open-Meteo's public keyless endpoints and falls back to a bundled seasonal estimate.

Open `index.html` directly, or run:

```powershell
powershell -ExecutionPolicy Bypass -File .\dev-server.ps1
```

Then visit `http://127.0.0.1:8767`.

Read [STANDALONE.md](STANDALONE.md) for the isolated GitHub Pages deployment.

## 2. ChatGPT App

The Apps SDK edition lives in `server.mjs` and `public/x-travel-widget.html`. Users add x-Travel Guide to a ChatGPT conversation. ChatGPT asks for the destination, dates, and interests, creates the detailed structured itinerary, and renders it in the interactive widget.

This architecture does not use an OpenAI API key in the project. ChatGPT supplies the model experience under the end user's ChatGPT account; the x-Travel Guide server only exposes the MCP tool and widget.

Requirements: Node.js 18 or newer.

```powershell
npm install
npm start
```

- Widget preview: `http://localhost:8787/preview`
- MCP endpoint: `http://localhost:8787/mcp`

Read [CHATGPT-APP.md](CHATGPT-APP.md) for ChatGPT connection and deployment instructions.

## Security

No edition should contain an OpenAI API key. The ChatGPT App prototype is stateless and unauthenticated because it has no saved accounts, bookings, or private records. Add OAuth before introducing user-specific server data.

See [SECURITY.md](SECURITY.md) before adding external services.
