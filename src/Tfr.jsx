// Tfr: fetches active TFRs from the FAA API and checks if any VIP TFRs are within 100 miles of SF.
// If found, calls onActiveTfrs() so the parent can hide "Local", then renders red "Active TFRs:" with linked notam IDs.
// Renders nothing (null) when no nearby VIP TFRs are active — the common case.
// 
import { useState, useEffect } from "react";

const SF = { lat: 37.7749, lon: -122.4194 };
const RADIUS_MILES = 100;
const CANDIDATE_STATES = ["CA", "NV"];

const proxyKey = import.meta.env.VITE_CORSPROXY_KEY;
const isDev = import.meta.env.DEV;

function getProxyUrl(url) {
    if (isDev) {
        // In local development, use Vite's dev proxy to bypass CORS
        return url.replace(/^https?:\/\/tfr\.faa\.gov/, "/faa-tfr-api");
    }
    return proxyKey
        ? `https://corsproxy.io/?key=${proxyKey}&url=${encodeURIComponent(url)}`
        : `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
}

function distanceMiles(lat1, lon1, lat2, lon2) {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function extractTfrCoords(xmlText) {
    const latRegex = /<(?:geo)?lat>([-\d.]+)\s*([NS])?<\/(?:geo)?lat>/gi;
    const lonRegex = /<(?:geo)?long>([-\d.]+)\s*([EW])?<\/(?:geo)?long>/gi;
    const lats = [];
    const lons = [];

    let m;
    while ((m = latRegex.exec(xmlText)) !== null) {
        let lat = parseFloat(m[1]);
        if (m[2]?.toUpperCase() === "S" && lat > 0) lat = -lat;
        if (!isNaN(lat)) lats.push(lat);
    }
    while ((m = lonRegex.exec(xmlText)) !== null) {
        let lon = parseFloat(m[1]);
        if (m[2]?.toUpperCase() === "W" && lon > 0) lon = -lon;
        if (!isNaN(lon)) lons.push(lon);
    }

    const count = Math.min(lats.length, lons.length);
    const coords = [];
    for (let i = 0; i < count; i++) {
        coords.push({ lat: lats[i], lon: lons[i] });
    }
    return coords;
}

async function isTfrNearSF(notamId) {
    const filename = "detail_" + notamId.replace("/", "_") + ".xml";
    const res = await fetch(getProxyUrl(`https://tfr.faa.gov/download/${filename}`));
    if (!res.ok) return false;
    const text = await res.text();
    const coords = extractTfrCoords(text);
    if (coords.length === 0) return false;

    return coords.some((c) => distanceMiles(SF.lat, SF.lon, c.lat, c.lon) <= RADIUS_MILES);
}

async function findVipTfrsNearSF() {
    const res = await fetch(getProxyUrl("https://tfr.faa.gov/tfrapi/exportTfrList"));
    if (!res.ok) {
        throw new Error(
            `TFR list fetch failed: HTTP ${res.status}${res.status === 401 ? " (API key required for corsproxy.io)" : ""}`
        );
    }
    const tfrs = await res.json();
    if (!Array.isArray(tfrs)) throw new Error("TFR list response is not an array");

    const candidates = tfrs.filter((t) =>
        t.type === "VIP" && (CANDIDATE_STATES.includes(t.state) || t.facility === "ZOA")
    );

    const matches = await Promise.all(
        candidates.map(async (tfr) => {
            const isNear = await isTfrNearSF(tfr.notam_id);
            return isNear ? tfr : null;
        })
    );

    return matches.filter(Boolean);
}

const Tfr = ({ onActiveTfrs }) => {
    const [activeTfrs, setActiveTfrs] = useState([]);

    useEffect(() => {
        findVipTfrsNearSF()
            .then(setActiveTfrs)
            .catch((err) => {
                console.warn("TFR fetch unavailable:", err.message || err);
                onActiveTfrs(false);
            });
    }, [onActiveTfrs]);

    useEffect(() => {
        onActiveTfrs(activeTfrs.length > 0);
    }, [activeTfrs, onActiveTfrs]);

    if (activeTfrs.length === 0) return null;

    return (
        <span>
            <span style={{ color: "red" }}>Active TFRs: </span>
            {activeTfrs.map((tfr, i) => (
                <span key={tfr.notam_id}>
                    {i > 0 && ", "}
                    <a
                        href={`https://tfr.faa.gov/tfr3/?page=detail_${tfr.notam_id.replace("/", "_")}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "underline" }}
                    >
                        {tfr.facility} {tfr.notam_id}
                    </a>
                </span>
            ))}
        </span>
    );
};

export default Tfr;

