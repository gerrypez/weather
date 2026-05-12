import { ref, get, set } from "firebase/database";
import { db } from "./firebase";
import { arraydata } from "./Arraydata";
import { Colorcalc } from "./Colorcalc";

const BATCH_SIZE = 8;
const BATCH_DELAY_MS = 500;

// Returns true if the cached data is older than the most recent NWS update (4AM or 4PM local).
function isStale(fetchedAt) {
    if (!fetchedAt) return true;
    const now = new Date();
    const fetched = new Date(fetchedAt);

    const today4AM = new Date(now);
    today4AM.setHours(4, 0, 0, 0);

    const today4PM = new Date(now);
    today4PM.setHours(16, 0, 0, 0);

    let lastUpdate;
    if (now >= today4PM) {
        lastUpdate = today4PM;
    } else if (now >= today4AM) {
        lastUpdate = today4AM;
    } else {
        lastUpdate = new Date(today4PM);
        lastUpdate.setDate(lastUpdate.getDate() - 1);
    }

    return fetched < lastUpdate;
}

async function fetchSiteColors(site) {
    const {
        sitename, station, grid_x, grid_y,
        hourstart, hourend,
        speedmin_ideal, speedmax_ideal,
        speedmin_edge, speedmax_edge,
        lightwind_ok, dir_ideal, dir_edge,
    } = site;

    const url = `https://api.weather.gov/gridpoints/${station}/${grid_x},${grid_y}/forecast/hourly`;

    async function fetchWithRetries(retries = 9) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url);
                if (response.ok) return await response.json();
                if (response.status === 500 || response.status === 503) {
                    console.warn(`${sitename} NWS ${response.status}, retry ${i + 1}`);
                    await new Promise((r) => setTimeout(r, 1500));
                } else {
                    console.error(`${sitename} NWS error ${response.status}`);
                    return null;
                }
            } catch {
                if (i === retries - 1) return null;
            }
        }
        return null;
    }

    const nwsdata = await fetchWithRetries();
    if (!nwsdata) return null;

    return Colorcalc(
        nwsdata,
        hourstart, hourend,
        speedmin_ideal, speedmax_ideal,
        speedmin_edge, speedmax_edge,
        lightwind_ok, dir_ideal, dir_edge
    );
}

// Fetch sites in batches to avoid overwhelming the NWS API.
async function fetchAllSiteColors() {
    const results = [];
    for (let i = 0; i < arraydata.length; i += BATCH_SIZE) {
        const batch = arraydata.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
            batch.map((site) => fetchSiteColors(site).then((colors) => ({ id: site.id, colors })))
        );
        results.push(...batchResults);
        if (i + BATCH_SIZE < arraydata.length) {
            await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
        }
    }
    return results;
}

// Reads color data from RTDB. If stale, fetches from NWS, runs Colorcalc,
// and writes the results back. Returns a map of site id → daycolors array.
export async function loadWeatherCache() {
    const cacheRef = ref(db, "weathercache");
    const snapshot = await get(cacheRef);
    const cached = snapshot.val();

    if (cached && !isStale(cached.fetchedAt)) {
        console.log("WeatherCache: using cached data from", new Date(cached.fetchedAt).toLocaleString());
        const sites = {};
        for (const [id, val] of Object.entries(cached.sites)) {
            sites[id] = Object.values(val).map((pair) => Object.values(pair));
        }
        return sites;
    }

    console.log("WeatherCache: cache stale, fetching from NWS in batches...");
    const results = await fetchAllSiteColors();

    const sites = {};
    for (const { id, colors } of results) {
        if (colors) sites[String(id)] = colors;
    }

    await set(cacheRef, { fetchedAt: Date.now(), sites });
    console.log("WeatherCache: RTDB updated at", new Date().toLocaleString());
    return sites;
}
