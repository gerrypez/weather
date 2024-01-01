/*
 *  FetchJson fetches the NWS API json data for a site, then ... 
 *  Calls Colorcalc function to determine day colors, daycolor array is returned to Sitedays.jsx
 *  An example API fetch URL is https://api.weather.gov/gridpoints/MTR/102/106/forecast/hourly
 */

import { Colorcalc } from "./Colorcalc.jsx";
import { useRef, useState, useEffect } from "react";

export const FetchJson = (id, sitename, station, grid_x, grid_y, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge) => {
    // console.log("<FetchJson /> called " + sitename + " - " + station + "/" + grid_x + "/" + grid_y);

    // daycolor is an array  ex. [["mo", "go-green"], ["Tu", "go-gray"], etc]
    const [daycolor, setDaycolor] = useState([]);

    function appendErrorMessage(errorMessage) {
        console.log("appending error messages to bottomspace");
        const bottomSpaceElement = document.querySelector(".bottomspace");
        // Get the current text content of the element
        const currentText = bottomSpaceElement.textContent;
        // Combine the current text with the error message
        const newText = `${currentText}${errorMessage}`;
        // Update the element's text content with the new text
        bottomSpaceElement.textContent = newText;
    }

    const siteURL = "https://api.weather.gov/gridpoints/" + station + "/" + grid_x + "," + grid_y + "/forecast/hourly";

    // useRef hook to store hasInitialCallMade
    const hasInitialCallMadeRef = useRef(false);

    // call the NWS API, retry up to 5 times
    useEffect(() => {
        const getWeatherJson = async () => {
            // const storedData = JSON.parse(localStorage.getItem("id"+id));
            // console.log("localStorage for  " + sitename + " : " + JSON.parse(localStorage.getItem("id"+id)));

            // This functions gets json data from NWS api
            async function fetchWithRetries(url, retries = 9) {
                for (let i = 0; i < retries; i++) {
                    try {
                        const response = await fetch(url);
                        // const response = await fetch(url, { mode: 'no-cors' });
                        if (response.ok) {
                            // good response from server, so return nws json data
                            return await response.json();
                        } else if (response.status === 500) {
                            // 500 error, server not responding, so retry every 1.5 seconds
                            console.error(sitename + " fetchWithRetries 500 server not responding error, retry " + (i + 1));
                            await new Promise((resolve) => setTimeout(resolve, 1500));
                        } else {
                            // Other server error like 404 or 503, no nws data from server
                            console.error(sitename + " fetchWithRetries 503 no data error, the error response.status is " + response.status);
                            return "503error";
                        }
                    } catch (error) {
                        // unable to fetch url
                        console.error(sitename + " fetchWithRetries catch(error), retries = " + retries);
                        if (i === retries - 1) {
                            throw new Error(sitename + " fetchWithRetries catch(error)");
                        }
                    }
                }
                throw new Error("FetchJson.jsx maximum number of retries reached");
            }

            // Fetch the nws data, using 9 retries every 1.5 seconds if necessary
            const nwsdata = await fetchWithRetries(siteURL, 9);

            // Given the nws json data, figure out the colors using Colorcalc
            // If there is a server error, use local Storage last values to populate the colors
            // Using hasInitialCallMadeRef is to make sure that Colorcalc is only called one time
            if (!hasInitialCallMadeRef.current) {
                if (nwsdata === "503error") {
                    // in this case, the nws json data was not available from the server
                    // so use the last locally stored values to populate the site row
                    // make sure that the local data starts from today
                    const errormessage = sitename + " 503 error,    ";
                    appendErrorMessage(errormessage);
                    console.log(sitename + " processsing 503error using local Storage !!! ");
                    const todaysDay = new Date().toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);
                    const storedData = JSON.parse(localStorage.getItem("id" + id));
                    if (storedData[0][0] === todaysDay) {
                        const colorresult = storedData;
                        setDaycolor(colorresult);
                    }
                } else {
                    // returns a javascript array
                    const colorresult = Colorcalc(nwsdata, sitename, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge);
                    // setDaycolor returns the final array daycolor back to Sitedays.jsx
                    setDaycolor(colorresult);
                }
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
