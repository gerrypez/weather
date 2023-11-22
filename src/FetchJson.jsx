/*
 *  FetchJson fetches the NWS API
 *  Calls Colorcalc function to determine day colors
 *  daycolor array is returned to Sitedays.jsx
 */

import { Colorcalc } from "./Colorcalc.jsx";
import { useRef, useState, useEffect } from "react";

export const FetchJson = (sitename, station, grid_x, grid_y, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge) => {
    // console.log("<FetchJson /> called " + sitename + " - " + station + "/" + grid_x + "/" + grid_y);

    // daycolor is an array  ex. [["mo", "go-green"], ["Tu", "go-gray"], etc]
    const [daycolor, setDaycolor] = useState([]);

    function showErrorMessage() {
        const errorMessageElement = document.getElementById("showtopmessage");
        errorMessageElement.style.display = "block";
    }

    const siteURL = "https://api.weather.gov/gridpoints/" + station + "/" + grid_x + "," + grid_y + "/forecast/hourly";

    // useRef hook to store hasInitialCallMade
    const hasInitialCallMadeRef = useRef(false);

    // call the NWS API, retry up to 5 times
    useEffect(() => {
        const getWeatherJson = async () => {
            async function fetchWithRetries(url, retries = 9) {
                for (let i = 0; i < retries; i++) {
                    try {
                        const response = await fetch(url);
                        if (response.ok) {
                            return await response.json();
                        } else if (response.status === 500) {
                            console.error(sitename + " FetchJson.jsx 500 error, retry number " + i + 1);
                            await new Promise((resolve) => setTimeout(resolve, 1500));
                        } else {
                            showErrorMessage();
                            throw new Error(sitename + " FetchJson.jsx unexpected response status");
                        }
                    } catch (error) {
                        console.error("FetchJson.jsx error fetching data");
                        if (i === retries - 1) {
                            throw error;
                        }
                    }
                }
                throw new Error("FetchJson.jsx maximum number of retries reached");
            }

            const nwsdata = await fetchWithRetries(siteURL, 9);

            // Call Colorcalc only one time
            if (!hasInitialCallMadeRef.current) {
                const colorresult = Colorcalc(nwsdata, sitename, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge);
                setDaycolor(colorresult);
                hasInitialCallMadeRef.current = true;
            }
        };

        // call getWeatherJson function
        try {
            getWeatherJson(siteURL);
        } catch (error) {
            console.log("FetchJson.jsx error: ", error);
        }
    }, [siteURL, sitename, dir_edge, dir_ideal, hourend, hourstart, lightwind_ok, speedmax_edge, speedmax_ideal, speedmin_edge, speedmin_ideal]);

    // console.log('FetchJson: ' + sitename + " - " + daycolor);
    // return the array daycolor to Sitedays.jsx
    return daycolor;
};
