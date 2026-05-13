// Tfr: fetches active TFRs from the FAA API and checks if any VIP TFRs are within 100 miles of SF.
// If found, calls onActiveTfrs() so the parent can hide "Local", then renders red "Active TFRs:" with linked notam IDs.
// Renders nothing (null) when no nearby VIP TFRs are active — the common case.
// 
import { useState, useEffect } from "react";

const SF = { lat: 37.7749, lon: -122.4194 };
const RADIUS_MILES = 100;
const CANDIDATE_STATES = ["CA", "NV"];
const proxy = (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`;

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

async function getTfrCoords(notamId) {
    const filename = "detail_" + notamId.replace("/", "_") + ".xml";
    const res = await fetch(proxy(`https://tfr.faa.gov/save_pages/${filename}`));
    const text = await res.text();
    const lat = parseFloat(text.match(/<lat>([\d.-]+)<\/lat>/)?.[1]);
    const lon = parseFloat(text.match(/<long>([\d.-]+)<\/long>/)?.[1]);
    return isNaN(lat) || isNaN(lon) ? null : { lat, lon };
}

async function findVipTfrsNearSF() {
    const res = await fetch(proxy("https://tfr.faa.gov/tfrapi/exportTfrList"));
    const tfrs = await res.json();

    const candidates = tfrs.filter((t) =>
        t.type === "VIP" && CANDIDATE_STATES.includes(t.state)
    );

    const results = (await Promise.all(
        candidates.map(async (tfr) => {
            const coords = await getTfrCoords(tfr.notam_id);
            if (!coords) return null;
            if (distanceMiles(SF.lat, SF.lon, coords.lat, coords.lon) > RADIUS_MILES) return null;
            return tfr;
        })
    )).filter(Boolean);

    return results;
}

const Tfr = ({ onActiveTfrs }) => {
    const [activeTfrs, setActiveTfrs] = useState([]);

    useEffect(() => {
        findVipTfrsNearSF()
            .then(setActiveTfrs)
            .catch((err) => console.error("TFR fetch failed:", err));
    }, []);

    useEffect(() => {
        onActiveTfrs(activeTfrs.length > 0);
    }, [activeTfrs]);

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
                        {tfr.notam_id}
                    </a>
                </span>
            ))}
        </span>
    );
};

export default Tfr;
