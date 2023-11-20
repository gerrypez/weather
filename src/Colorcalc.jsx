/*
 *  Given the nswdata (site json) from FetchJson, Colorcalc.jsx calculates
 *  day colors using the site information in Arraydata.jsx
 */

export const Colorcalc = (nwsdata, sitename, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge) => {

    // initialize day, color array variable to store color results
    // this will be populated ex. [['Mo','go-green'], ['Tu','go-yellow'], etc]
    var colorresult = [
        ["", ""],
        ["", ""],
        ["", ""],
        ["", ""],
        ["", ""],
        ["", ""],
        ["", ""],
    ];

    // declare variables
    var green_total = 0;
    var yellow_total = 0;
    var timestr = "";
    var thespeed = 0;
    var nwswindspeed = 0;
    var thedirection = "";
    var rainscore = 0;
    var rainprob = 0;
    var i = 0;
    var api_hour = 0;
    var arrayposition = 0;

    // create week array variable
    var weekday = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Sa"];

    // determine what day of the week it is today (0 to 6)
    var d = new Date();
    var day_num = d.getDay();

    // countperiods = 156 for the NWS API (156 one-hour periods)
    var countperiods = Object.keys(nwsdata.properties.periods).length;

    // loop through each of 156 hours to assign a color (go-green, etc)
    for (i = 0; i < countperiods; i++) {

        // get the start hour (T00 to T24) for the data block
        // Example format for timestr is 2023-11-23T08:00:00-08:00
        // Note the -08:00 means the UTC offset is done so it is local time
        timestr = nwsdata.properties.periods[i].startTime;

        // isolate which hour is being analyzed 0 to 24
        // NWS seems to always calculate the UTC offset, so api_hour is the local hour
        api_hour = timestr.substring(11, 13);
        api_hour = parseInt(api_hour);

        // get the wind speed for the hour, windSpeed is reported like "3 mph"
        thespeed = nwsdata.properties.periods[i].windSpeed;
        nwswindspeed = thespeed.substring(0, thespeed.indexOf("mph"));
        nwswindspeed = parseInt(nwswindspeed);

        // get the wind direction, ex.  "windDirection": "SW"
        thedirection = nwsdata.properties.periods[i].windDirection;

        // get the probability of rain (0 to 100)
        rainprob = nwsdata.properties.periods[i].probabilityOfPrecipitation.value;
        rainprob = parseInt(rainprob);

        // at api_hour 23 the day is completed, so add up for previous day and color
        if (api_hour === 23) {
            // assign the day in colorresult
            // reminder - colorresult looks like this [['Mo','go-green'], ['Tu','go-yellow'], etc]
            colorresult[arrayposition][0] = weekday[day_num];

            // assign the color in colorresult
            // these colors (ex. go-yellow) are CSS properties
            colorresult[arrayposition][1] = "go-gray";
            if (yellow_total >= 2 && rainscore <= 5) {
                colorresult[arrayposition][1] = "go-yellow";
            }
            if (yellow_total >= 2 && rainscore > 5) {
                colorresult[arrayposition][1] = "go-yellow-blue";
            }
            if (green_total >= 1 && green_total <= 3) {
                colorresult[arrayposition][1] = "go-lightgreen";
            }
            if (green_total >= 1 && rainscore > 5) {
                colorresult[arrayposition][1] = "go-lightgreen-blue";
            }
            if (green_total >= 4) {
                colorresult[arrayposition][1] = "go-green";
            }
            if (green_total >= 4 && rainscore > 5) {
                colorresult[arrayposition][1] = "go-lightgreen-blue";
            }

            // move to the next day
            arrayposition++;

            // day_num is 0 (sunday) to 6 (saturday)
            day_num++;
            if (day_num === 7) {
                day_num = 0;
            } // set it back to Sunday

            // reset colors for next day period
            green_total = 0;
            yellow_total = 0;
            rainscore = 0;

            // we are still within the hour boundary set in Arraydata.jsx
            // so keep adding up color scores
        } else if (api_hour >= hourstart && api_hour <= hourend) {
            if (nwswindspeed >= speedmin_ideal && nwswindspeed <= speedmax_ideal && dir_ideal.indexOf(thedirection) > -1) {
                console.log(sitename + " GREEN   T=" + api_hour + ", speed:" + thespeed + " " + thedirection + ", day " + weekday[day_num]);
                // conditions for this hour look good, increment green
                green_total = green_total + 1;
                yellow_total = yellow_total + 1;
            } else if (nwswindspeed >= speedmin_edge && nwswindspeed <= speedmax_edge && dir_edge.indexOf(thedirection) > -1) {
                console.log(sitename + " YELLOW   T=" + api_hour + " speed:" + thespeed + " " + thedirection + ", day " + weekday[day_num]);
                // conditions for this hour are within the edge boundaries, so increment yellow
                yellow_total = yellow_total + 1;
            } else if (nwswindspeed <= 5 && lightwind_ok === "yes") {
                console.log(sitename + " LIGHTWIND  T=" + api_hour +  ", speed:" + thespeed + " " + thedirection + ", day " + weekday[day_num]);
                // sites that can take light wind (regardless of direction) increment yellow
                yellow_total = yellow_total + 1;
            } else {
                console.log(sitename + " GRAY   T=" + api_hour + ", speed:" + thespeed + " " + thedirection + ", day " + weekday[day_num]);
            }

            // increment rainscore if rain is probable
            if (rainprob > 33) {
                rainscore = rainscore + 1;
            }
        }
    } // end the 156 hour loop

    // console.log(sitename + "   colorcalc: " + colorresult);
    // done, soreturn the colorresult array
    return colorresult;
};
