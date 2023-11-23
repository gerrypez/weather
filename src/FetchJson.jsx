/*
 *  FetchJson fetches the NWS API
 *  Calls Colorcalc function to determine day colors
 *  daycolor array is returned to Sitedays.jsx
 */

import { Colorcalc } from "./Colorcalc.jsx";
import { useRef, useState, useEffect } from "react";

export const FetchJson = (id, sitename, station, grid_x, grid_y, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge) => {
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
                            // Good response from server, so return nws json data
                            return await response.json();
                        } else if (response.status === 500) {
                            // 500 error, server not responding
                            console.error(sitename + " FJ 500(?) error, retry " + i + 1);
                            // try again in 1.5 seconds
                            await new Promise((resolve) => setTimeout(resolve, 1500));
                        } else {
                            // 503 error server unavailable, or 404 error api url not found
                            // tollhouse FJ 503(GP) error, retry 81
                            console.error(sitename + " FJ 503(GP) error, retry " + i + 1);

                            // show the error message in client at the top of the page
                            showErrorMessage();

                            /*
                            * Test this if there is a 503 error
                            * (1) first see if the down site has proper local storage, getting Woah message below
                            * (2) if so, try to return storedData
                            */

                            // get todays day in the format Mo, Tu etc
                            const todaysDay = new Date().toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);

                            // get data from local storage
                            const storedData = JSON.parse(localStorage.getItem("id"+id));
                            if (storedData[0][0] === todaysDay) {
                                console.log(sitename + "Woah - got storedData, return this???" + storedData);
                                // return storedData;
                            }

                            // this happens after several retrys
                            throw new Error(sitename + " FJ bottom error message");
                        }
                    } catch (error) {
                        // 404 error, api url not found
                        console.error(sitename + " FJ catch (error)... ");
                        if (i === retries - 1) {
                            console.error("FJ throw error ... ");
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

                // setDaycolor returns the final array daycolor back to Sitedays.jsx
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
    }, [siteURL, id, sitename, dir_edge, dir_ideal, hourend, hourstart, lightwind_ok, speedmax_edge, speedmax_ideal, speedmin_edge, speedmin_ideal]);

    // console.log('FetchJson: ' + sitename + " - " + daycolor);
    // return the array daycolor to Sitedays.jsx

    return daycolor;
};
