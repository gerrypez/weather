# Lift Weather

SF Bay Area paragliding site weather forecast app. Displays a table of paragliding sites with color-coded boxes indicating flying conditions for the next 7 days, sourced from the NWS (National Weather Service) API.

## Commands

```bash
npm run dev      # start Vite dev server (http://localhost:5173)
npm run build    # production build to dist/
npm run preview  # preview the production build locally
firebase deploy  # deploy hosting + RTDB security rules to Firebase
```

## Architecture

Single-page React app with no backend. Data is cached in Firebase Realtime Database (RTDB) and refreshed client-side when stale.

**Data flow:**
1. `Arraydata.jsx` — static array of site definitions (lat/lon, NWS grid coords, wind parameters)
2. `Allrows.jsx` calls `WeatherCache.js` on load
3. `WeatherCache.js` reads the color cache from Firebase RTDB
   - If fresh: returns cached data immediately (fast path — one RTDB read)
   - If stale: fetches NWS hourly forecast for each site in batches of 8, runs `Colorcalc.jsx`, writes results back to RTDB
4. `Sitedays.jsx` renders the colored day boxes from the data passed down

**Cache staleness:** data is considered stale if it was fetched before the most recent NWS update (4AM or 4PM local time). The first user after each update window triggers the NWS refresh; all subsequent users get the cached RTDB result.

**NWS API URL per site:**
`https://api.weather.gov/gridpoints/{station}/{grid_x},{grid_y}/forecast/hourly`

**Color classes** (defined in `src/index.css`):
- `go-green` — ideal wind speed + direction, ≥4 qualifying hours
- `go-lightgreen` — ideal conditions, 1–3 hours
- `go-yellow` — edge conditions (broader speed/direction range), ≥2 hours
- `go-gray` — unlikely to fly
- `*-blue` variants (e.g. `go-yellow-blue`) — rain probability >33% on any of those hours
- `go-black` — today after 6PM (day is done)

## Key Files

| File | Purpose |
|---|---|
| `src/Arraydata.jsx` | All site definitions — add/edit sites here |
| `src/WeatherCache.js` | RTDB read/write + NWS fetch + staleness logic |
| `src/Colorcalc.jsx` | Wind scoring logic; converts NWS JSON → 7-day color array |
| `src/firebase.js` | Firebase app init + Realtime Database export |
| `src/App.jsx` | Root component; auto-reloads every hour |
| `src/Allrows.jsx` | Loads weather cache, renders Local / Remote / Kiting sections |
| `src/Arow.jsx` | One row per site; click to expand links and NWS meteogram |
| `src/Sitedays.jsx` | Renders the 7 colored day boxes; shows gray placeholders while loading |
| `src/index.css` | All styles including responsive mobile layout (≤600px breakpoint) |
| `index.html` | Vite entry HTML (project root, not public/) |
| `vite.config.js` | Vite config |
| `firebase.json` | Firebase Hosting (serves `dist/`) + RTDB rules reference |
| `database.rules.json` | RTDB security rules — only `weathercache` path is accessible |

## Firebase

- **Project:** `liftweather-c9ac8`
- **Hosting:** serves the `dist/` build
- **Realtime Database:** `https://liftweather-c9ac8-default-rtdb.firebaseio.com`
  - Path: `/weathercache` — stores `{ fetchedAt: timestamp, sites: { "1": [[day,color],...], ... } }`
  - Rules: public read/write on `/weathercache` only; all other paths denied
- **Note:** the project has Firestore in Datastore mode (legacy Google Cloud); do not use it — use RTDB only

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
- Vite 8
- Firebase Realtime Database (weather cache)
- Firebase Hosting (deployment)
- CSS (plain, no framework) — `src/index.css`
- No backend, no state management library, no component library
