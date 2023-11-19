/*
 *
 *  FetchJson fetches the NWS API
 *  then calls Colorcalc function to determine day colors
 *  daycolor array is passed back to Sitedays.jsx
 *
 */

import { Colorcalc } from "./Colorcalc.jsx";
import { useState, useEffect } from "react";

export const FetchJson = (sitename, station, grid_x, grid_y, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge) => {
    // console.log("<FetchJson /> called " + sitename + " - " + station + "/" + grid_x + "/" + grid_y);

    // daycolor is an array  ex. [["mo", "go-green"], ["Tu", "go-gray"], etc]
    const [daycolor, setDaycolor] = useState([]);

    const siteURL = "https://api.weather.gov/gridpoints/" + station + "/" + grid_x + "," + grid_y + "/forecast/hourly";

    // useEffect hook to call the NWS API
    useEffect(() => {
        // asynch getWeatherJson function
        const getWeatherJson = async () => {
            // old code ... used this, worked, but sometimes got 500 error
            // so I replaced it with fetch retries
            // const response = await fetch(siteURL);
            // const nwsdata = await response.json();

            async function fetchWithRetries(url, retries = 5) {
                for (let i = 0; i < retries; i++) {
                    try {
                        const response = await fetch(url);
                        if (response.ok) {
                            return await response.json();
                        } else if (response.status === 500) {
                            console.error("FetchJson.jsx" + sitename + "500 error, Retrying...");
                            await new Promise((resolve) => setTimeout(resolve, 1000));
                        } else {
                            throw new Error("FetchJson.jsx" + sitename + "Unexpected response status");
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

            const nwsdata = await fetchWithRetries(siteURL, 5);

            // async function fetchData() {
            //     while (true) {
            //       try {
            //         const nwsdata = await fetchWithRetries(siteURL, 5);
            //         // Process the fetched data here
            //         console.log('yes ... ran the function again after 3 hours');
            //       } catch (error) {
            //         console.error('Error fetching data:', error);
            //       }

            //       await new Promise((resolve) => setTimeout(resolve, 10800000)); // Wait 3 hours (10800000 milliseconds)
            //     }
            //   }
            //   setInterval(fetchData, 10800000); // Call fetchData every 3 hours

            // send NWS json to function Colorcalc
            const colorresult = Colorcalc(nwsdata, sitename, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge);

            // store color result for site, this is used by Sitedays.jsx
            setDaycolor(colorresult);

        };  // end getWeatherJson

        // call getWeatherJson async function (this works, trying a repeat every 3 hours)
        try {
            getWeatherJson(siteURL);
        } catch (error) {
            //handle error
            console.log("FetchJson.jsx error: ", error);
        }

        //  test - see if this runs every 3 hours
        // async function fetchWeatherData(siteURL) {
        //     try {
        //         getWeatherJson(siteURL);
        //         // Process the fetched weather data here
        //         const now = new Date();
        //         console.log("Fetched weather data" + sitename + " " + now);
        //     } catch (error) {
        //         console.error("Error fetching weather data:", error);
        //     }
        // }
        // setInterval(fetchWeatherData(siteURL), 10800000); // Call fetchWeatherData every 3 hours


    }, [siteURL, sitename, dir_edge, dir_ideal, hourend, hourstart, lightwind_ok, speedmax_edge, speedmax_ideal, speedmin_edge, speedmin_ideal]);

    // console.log('FetchJson: ' + sitename + " - " + daycolor);
    // return the array daycolor to Sitedays.jsx
    return daycolor;
};
