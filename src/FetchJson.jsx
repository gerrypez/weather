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

            // fetch the NWS API for site data
            const response = await fetch(siteURL);
            
            const nwsdata = await response.json();

            // send NWS json to function Colorcalc
            const colorresult = Colorcalc(nwsdata, sitename, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge);

            // store color result for site, this is used by Sitedays.jsx
            setDaycolor(colorresult);

        };

        // call getWeatherJson async function
        try {
            getWeatherJson(siteURL);
        } catch (error) {
            //handle error
            console.log("FetchJson.jsx error: ", error);
        }
    }, [siteURL, sitename, dir_edge, dir_ideal, hourend, hourstart, lightwind_ok, speedmax_edge, speedmax_ideal, speedmin_edge, speedmin_ideal]);

    // console.log('FetchJson: ' + sitename + " - " + daycolor);
    // return the array daycolor to Sitedays.jsx
    return daycolor;
};
