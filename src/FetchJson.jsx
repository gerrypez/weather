import { Colorcalc } from "./Colorcalc.jsx";
// import React, { useState, useEffect } from "react";
import { useState, useEffect } from "react";

/*
 *
 *  FetchJson gets the NWS API response for station/grid_x/grid_y
 *  It calls Colorcalc to calculate the day colors.
 *
 */

export const FetchJson = (name, station, grid_x, grid_y, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge) => {
    // console.log("<FetchJson />" + station + "/" + grid_x + "/" + grid_y + "----" + hourstart);

    const [daysarray, setDaysarray] = useState([]);


    const siteURL = "https://api.weather.gov/gridpoints/" + station + "/" + grid_x + "," + grid_y + "/forecast/hourly";

    // console.log(siteURL);

    // const [data, setData] = useState();

    // useEffect hook
    useEffect(() => {
        // asynch getWeatherJson function
        const getWeatherJson = async () => {
            const response = await fetch(siteURL);
            const nwsdata = await response.json();

            // data gets the value of the NWS json return
            // setData(json);

            // send NWS json to color calculation
            const results = Colorcalc(nwsdata, name, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge);

            // console.log ('here is the results passed to FetchJson:'+results);
            setDaysarray(results);

            // console.log("here is daysarray in Fetch:"+ daysarray)
            // update coped  Array variable here
        };

        try {
            getWeatherJson(siteURL);
        } catch (error) {
            //handle error here
            console.log("FetchJson error: ", error);
        }
    }, [siteURL, name, dir_edge, dir_ideal, hourend, hourstart, lightwind_ok, speedmax_edge, speedmax_ideal, speedmin_edge, speedmin_ideal]);

    // if (!data) {
    //     return <p>FetchJson error, no data</p>;
    // }

    // var daycolors = [
    //     ["mo", "go-blue"],
    //     ["tu", "go-green"],
    //     ["we", "go-blue"],
    //     ["th", "go-blue"],
    //     ["fr", "go-blue"],
    //     ["sa", "go-blue"],
    //     ["su", "go-blue"]];

    // console.log('FetchJson:'+daysarray);
    // return JSON.stringify(daysarray);
    return daysarray;
};
