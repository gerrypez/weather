const SF = { lat: 37.7749, lon: -122.4194 };
const RADIUS_MILES = 100;
const RADIUS_NM = RADIUS_MILES / 1.15078;

// Pre-filter: only states that could be within 100 miles of SF
const CANDIDATE_STATES = ['CA', 'NV'];

function distanceNM(lat1, lon1, lat2, lon2) {
  const R = 3440.065;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getTfrCoords(notamId) {
  const filename = 'detail_' + notamId.replace('/', '_') + '.xml';
  const res = await fetch(`https://tfr.faa.gov/save_pages/${filename}`);
  const text = await res.text();
  const lat = parseFloat(text.match(/<lat>([\d.-]+)<\/lat>/)?.[1]);
  const lon = parseFloat(text.match(/<long>([\d.-]+)<\/long>/)?.[1]);
  return isNaN(lat) || isNaN(lon) ? null : { lat, lon };
}

async function findVipTfrsNearSF() {
  const res = await fetch('https://tfr.faa.gov/tfrapi/exportTfrList');
  const tfrs = await res.json();

  // Pre-filter to VIP type and nearby states before making XML requests
  const candidates = tfrs.filter(t =>
    t.type === 'VIP' && CANDIDATE_STATES.includes(t.state)
  );

  console.log(`${tfrs.length} total TFRs → ${candidates.length} VIP candidate(s) in ${CANDIDATE_STATES.join('/')} — fetching coordinates...`);

  // Fetch all candidate XMLs in parallel
  const results = (await Promise.all(
    candidates.map(async tfr => {
      const coords = await getTfrCoords(tfr.notam_id);
      if (!coords) return null;

      const distanceMiles = distanceNM(SF.lat, SF.lon, coords.lat, coords.lon) * 1.15078;
      if (distanceMiles > RADIUS_MILES) return null;

      return { ...tfr, coords, distanceMiles: Math.round(distanceMiles) };
    })
  )).filter(Boolean);

  console.log(`Found ${results.length} VIP TFR(s) within ${RADIUS_MILES} miles of San Francisco:`);
  console.log(JSON.stringify(results, null, 2));
  return results;
}

findVipTfrsNearSF();

// https://tfr.faa.gov/tfr3/?page=detail_6_9456

// in the header bar there is an <div> for messages - use that 

