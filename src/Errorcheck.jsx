/*
 *  To run Errorcheck, undo comments in Allrows.jsx
 *   This verifies the GPS lat,lng match the station/gridX/gridY
 *   Ideally this is called in a separate API for the app
 */

import { useEffect } from "react";

const Errorcheck = ({ arraydata }) => {
    function CheckStations(sitename, lat, lng, station, grid_x, grid_y) {
        const siteURL = "https://api.weather.gov/points/" + lat + "," + lng;

        useEffect(() => {
            const getWeatherJson = async (siteURL) => {
                async function fetchWithRetries(siteURL) {
                    const response = await fetch(siteURL);
                    return await response.json();
                }
                const nwsdata = await fetchWithRetries(siteURL);
                if (grid_x !== nwsdata.properties.gridX || grid_y !== nwsdata.properties.gridY || station !== nwsdata.properties.gridId) {
                    const errorMessage = sitename + " " + station + "/" + grid_x + "/" + grid_y + " should be " + nwsdata.properties.gridId + "/" + nwsdata.properties.gridX + "/" + nwsdata.properties.gridY;
                    console.log(errorMessage);
                }
            };
            try {
                getWeatherJson(siteURL);
            } catch (error) {
                console.log("error: ", error);
            }
        }, [siteURL, sitename, grid_x, grid_y, station]);

        return null;
    }

    return (
        <div>
            <div className="errorcheckarea">
                Running error check ... to console.log
                {arraydata.map((data) => (
                    <div className="errorstationcheck" key={data.id}>
                        {CheckStations(data.sitename, data.lat, data.lng, data.station, data.grid_x, data.grid_y)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Errorcheck;
