# Lift Weather

SF Bay Area paragliding site weather forecast app. Displays a table of paragliding sites with color-coded boxes indicating flying conditions for the next 7 days, sourced from the NWS (National Weather Service) API.

## Commands

```bash
npm run dev      # start Vite dev server (http://localhost:5173)
npm run build    # production build to dist/
npm run preview  # preview the production build locally
```

Deployed to Firebase Hosting. Build artifacts go to `dist/`.

## Architecture

Single-page React app with no backend. All data fetched client-side from the NWS API.

**Data flow:**
1. `Arraydata.jsx` — static array of site definitions (lat/lon, NWS grid coords, wind parameters)
2. `Sitedays.jsx` → `FetchJson.jsx` — fetches NWS hourly forecast JSON for each site
3. `Colorcalc.jsx` — computes a 7-day array of `[dayLabel, cssClass]` pairs from the forecast
4. `Sitedays.jsx` — renders the colored day boxes; caches results in `localStorage` for 503 fallback

**NWS API calls per site:**
- Grid lookup: `https://api.weather.gov/points/{lat},{lon}` (grid coords pre-filled in Arraydata)
- Hourly forecast: `https://api.weather.gov/gridpoints/{station}/{grid_x},{grid_y}/forecast/hourly`

**Color classes** (defined in `index.css`):
- `go-green` — ideal wind speed + direction, ≥4 qualifying hours
- `go-lightgreen` — ideal conditions, 1–3 hours
- `go-yellow` — edge conditions (broader speed/direction range), ≥2 hours
- `go-gray` — unlikely to fly
- `*-blue` variants (e.g. `go-yellow-blue`) — rain probability >33% on any of those hours

## Key Files

| File | Purpose |
|---|---|
| `src/Arraydata.jsx` | All site definitions — add/edit sites here |
| `src/Colorcalc.jsx` | Wind scoring logic; converts NWS JSON → day color array |
| `src/FetchJson.jsx` | NWS API fetch with 9-retry logic; 503 fallback via localStorage |
| `src/App.jsx` | Root component; auto-reloads every hour for fresh NWS data |
| `src/Allrows.jsx` | Renders Local / Remote / Kiting sections |
| `src/Arow.jsx` | One row per site; click to expand links and NWS meteogram |
| `index.html` | Vite entry HTML (root of project, not public/) |
| `vite.config.js` | Vite config with @vitejs/plugin-react |

## Site Definition Fields (Arraydata.jsx)

```js
{
  id: 1,
  sitename: "blue rock",
  category: "local",        // "local" | "remote" | "kiting"
  lat: 38.1384,
  lng: -122.1959,
  station: "STO",           // NWS station ID
  grid_x: 13,               // from api.weather.gov/points/{lat},{lon}
  grid_y: 54,
  hourstart: 10,            // flyable window start (local hour, 0-23)
  hourend: 20,              // flyable window end
  speedmin_ideal: 8,        // mph
  speedmax_ideal: 13,
  speedmin_edge: 6,
  speedmax_edge: 16,
  lightwind_ok: "no",       // "yes" if site flies in calm conditions
  dir_ideal: ["SW", "WSW", "W", "WNW"],
  dir_edge: ["SW", "WSW", "W", "WNW", "NW"],
  nws_image: "...",         // NWS meteogram URL
  link_forecasts: [...],    // forecast links shown in expanded row
  link_current: [...],      // current condition links (weather stations)
  link_data: [...],         // API/map/site guide links
}
```

## Tech Stack

- React 19
- React Router 7 (BrowserRouter for Firebase Hosting)
- Vite 6
- CSS (plain, no framework) — `src/index.css`
- Firebase Hosting (`firebase.json`)
- No backend, no state management library, no component library
