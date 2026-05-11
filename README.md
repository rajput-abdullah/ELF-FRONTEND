# Spotter ELD — Frontend

This is a small React + TypeScript frontend built with Vite. It includes:
- Trip planner form (sample button)
- Mapbox map view (shows simple route and markers)
- Summary view showing plan response
- PDF viewer for daily logs (download & zoom)

Setup
1. Install dependencies:

```bash
cd /Users/abdullahshahbaz/Desktop/elf-frontend
npm install
```


2. Set your Mapbox token for development. The app will look for the token in this order:

- `window.MAPBOX_TOKEN` (quick dev console option)
- `VITE_MAPBOX_TOKEN` (recommended for Vite; set in `.env` as VITE_MAPBOX_TOKEN=pk...)
- legacy `REACT_APP_MAPBOX_TOKEN` in `.env` (will also be used)

For a quick test open the browser console and run:

```js
window.MAPBOX_TOKEN = 'pk.your_mapbox_token_here'
```

To persist the token for Vite dev, add to your `.env` at project root:

```properties
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
```

Then restart the dev server.

3. Run dev server:

```bash
npm run dev
```

Notes
- Backend endpoints are expected at http://127.0.0.1:8000/api/plan-trip/ for POST and /:uuid/logs.pdf for PDF.
- This is a focused frontend. You can extend the map rendering of the full route from Mapbox by returning the geojson from backend.
