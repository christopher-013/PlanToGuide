# Tokyo, Japan PlanToGuide Website

This package contains the complete visual trip website and a round-trip AI planning workflow.

## Files

- `index.html` — complete visual itinerary website
- `styles.css` — website presentation
- `app.js` — exported navigation runtime
- `manifest.webmanifest` — install metadata for the guide
- `sw.js` — offline cache for hosted guides
- `icons/` — installable home-screen icons
- `plan-x-guide-centered-compass-morph-clean-x.svg` — animated PlanToGuide logo
- `assets/` — bundled banners and place graphics, when available
- `TRIP-PLAN.md` — lightweight human-readable plan plus photo metadata
- `TRIP-DATA.json` — complete machine-readable trip, including local photo data
- `AGENT-INSTRUCTIONS.md` — rules for continued AI planning
- `README.md` — this publishing guide

## Offline and install support

Once this guide is hosted over HTTPS and opened once, it works offline and can be installed to your home screen. Google Maps embeds and any non-bundled remote images still require an internet connection and will fall back gracefully.

## Keep planning

1. Give `TRIP-PLAN.md` to ChatGPT, Claude, or another AI assistant.
2. Ask it to return the complete updated file, including the `json plantoguide-trip` block.
3. In PlanToGuide, choose **Import updated plan** to re-render the website.
4. Export a fresh package.

## Publishing

Open `index.html` locally, drag the folder to Netlify Drop, or upload it to any static host such as GitHub Pages. Google Maps and remote images require an internet connection.
