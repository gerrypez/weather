// Stationcheck: dev utility that verifies each site's NWS station/gridX/gridY matches its lat/lon.
// To run, import and render <Stationcheck arraydata={arraydata} /> in Allrows.jsx; results appear in the console.
//
import { useEffect } from "react";

const StationRow = ({ sitename, lat, lng, station, grid_x, grid_y }) => {
    const siteURL = "https://api.weather.gov/points/" + lat + "," + lng;

    useEffect(() => {
        const getWeatherJson = async () => {
            const response = await fetch(siteURL);
            const nwsdata = await response.json();
            if (grid_x !== nwsdata.properties.gridX || grid_y !== nwsdata.properties.gridY || station !== nwsdata.properties.gridId) {
                console.log("SITE ERROR :" + sitename + " " + station + "/" + grid_x + "/" + grid_y + " should be " + nwsdata.properties.gridId + "/" + nwsdata.properties.gridX + "/" + nwsdata.properties.gridY);
            } else {
                console.log(sitename + " ok");
            }
        };
        getWeatherJson().catch((error) => console.log("error: ", error));
    }, [siteURL, sitename, grid_x, grid_y, station]);

    return null;
};

const Stationcheck = ({ arraydata }) => {
    return (
        <div>
            <div className="stationcheckarea">
                CheckStations running ... see results in console.log
                {arraydata.map((data) => (
                    <div className="errorstationcheck" key={data.id}>
                        <StationRow
                            sitename={data.sitename}
                            lat={data.lat}
                            lng={data.lng}
                            station={data.station}
                            grid_x={data.grid_x}
                            grid_y={data.grid_y}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Stationcheck;
