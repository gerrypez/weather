import { ref, get, set } from "firebase/database";
import { db } from "./firebase";
import { arraydata } from "./Arraydata";
import { Colorcalc } from "./Colorcalc";

const BATCH_SIZE = 8;
const BATCH_DELAY_MS = 500;

// Returns true if the cached data is older than the most recent NWS update (2AM or 2PM local).
function isStale(fetchedAt) {
    if (!fetchedAt) return true;
    const now = new Date();
    const fetched = new Date(fetchedAt);

    const today2AM = new Date(now);
    today2AM.setHours(2, 0, 0, 0);

    const today2PM = new Date(now);
    today2PM.setHours(14, 0, 0, 0);

    let lastUpdate;
    if (now >= today2PM) {
        lastUpdate = today2PM;
    } else if (now >= today2AM) {
        lastUpdate = today2AM;
    } else {
        lastUpdate = new Date(today2PM);
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

function parseCachedSites(cachedSites) {
    const sites = {};
    for (const [id, val] of Object.entries(cachedSites)) {
        sites[id] = Object.values(val).map((pair) => Object.values(pair));
    }
    return sites;
}

// Reads color data from RTDB. If stale, fetches from NWS, runs Colorcalc,
// and writes the results back. Returns { sites, nwsError } where nwsError is
// true if all NWS fetches failed (in which case stale cached data is returned
// unchanged rather than overwriting the cache with empty data).
export async function loadWeatherCache() {
    const cacheRef = ref(db, "weathercache");
    const snapshot = await get(cacheRef);
    const cached = snapshot.val();

    if (cached && !isStale(cached.fetchedAt)) {
        console.log("WeatherCache: using cached data from", new Date(cached.fetchedAt).toLocaleString());
        return { sites: parseCachedSites(cached.sites), nwsError: false };
    }

    console.log("WeatherCache: cache stale, fetching from NWS in batches...");
    const results = await fetchAllSiteColors();

    const sites = {};
    for (const { id, colors } of results) {
        if (colors) sites[String(id)] = colors;
    }

    if (Object.keys(sites).length === 0) {
        // All NWS fetches failed — preserve the existing cache rather than
        // overwriting it with empty data and a fresh timestamp.
        console.warn("WeatherCache: all NWS fetches failed, preserving stale cache");
        const staleSites = cached?.sites ? parseCachedSites(cached.sites) : {};
        return { sites: staleSites, nwsError: true };
    }

    // Merge: keep stale cached data for any sites that failed this fetch cycle
    // so they don't go blank when only a subset of NWS calls succeed.
    if (cached?.sites) {
        const staleSites = parseCachedSites(cached.sites);
        for (const [id, colors] of Object.entries(staleSites)) {
            if (!sites[id]) sites[id] = colors;
        }
    }

    await set(cacheRef, { fetchedAt: Date.now(), sites });
    console.log("WeatherCache: RTDB updated at", new Date().toLocaleString());
    return { sites, nwsError: false };
}
