// import {arraydata} from "./Arraydata";
// import nwsdata from './nwsdata.json';

export const Colorcalc = (nwsdata, name, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge) => {
    // console.log("wwwww"+JSON.stringify(nwsdata));

    // let date = new Date();
    // console.log(date);
    // let day = date.toLocaleString("en-us", { weekday: "short"});
    // console.log(day);

    // console.log("hourstart from Colorcalc " + hourstart);

    // declare variable that will be changed and
    var colorresult = [
        ["d1", "gray"],
        ["d2", "gray"],
        ["d3", "gray"],
        ["d4", "gray"],
        ["d5", "gray"],
        ["d6", "gray"],
    ];

    // declare variables
    var greeno = 0;
    var yellowo = 0;
    var timestr = "";
    var thehour = "";
    var isutc = "";
    var thespeed = 0;
    var speedmin_act = 0;
    var speedmax_act = 0;
    var speedmax_actarray = "";
    var thedirection = "";
    var therain = "";
    var rain_score = 0;
    var i = 0;
    var intoffset = 7;
    var inthour = 0;
    var arrayposition = 0;

    // determine what day of the week it is today (0 to 6)
    var d = new Date();
    var weekday = new Array(7);
    weekday[0] = "Su";
    weekday[1] = "Mo";
    weekday[2] = "Tu";
    weekday[3] = "We";
    weekday[4] = "Th";
    weekday[5] = "Fr";
    weekday[6] = "Sa";
    var todaynum = d.getDay();

    // this is the NWS JSON date, ex.
    // Dec 03 2022 15:01:21 GMT-0800 (Pacific Standard Time)
    // var mysql_date = new Date(nwsdata.properties.updated);

    // there are always 156 periods (hours) in the NWS JSON, so this below = 156
    var countperiods = Object.keys(nwsdata.properties.periods).length;

    // loop through each hour to assign a color (ex. good = green, etc)
    for (i = 0; i < countperiods; i++) {
        // get the start hour (0 to 24) for the data block
        timestr = nwsdata.properties.periods[i].startTime; // 2022-09-09T13:00:00-07:00
        // console.log("timestr =" + timestr);
        thehour = timestr.substring(11, 13); // 13
        inthour = parseInt(thehour); // string 13 because integer 13
        // console.log("inthour = " + inthour);

        // if the return is UTC time, we have to convert it to PT
        // this seems not ot be needed for current NWS returns
        isutc = timestr.substring(20, 22); //  07 for PT, 00 for UTC return
        if (isutc === "00") {
            intoffset = parseInt(isutc); // 07 becomes the integer 7
            inthour = inthour - intoffset;
            if (inthour < 0) {
                inthour = inthour + 24;
            }
        }

        // get the wind speed for the hour, windSpeed is reported two ways
        // "3 mph" ... so strip the mph and make it an integer
        // "3 mph to 8 mph" need to deal with sometimes it's "windSpeed": "3 to 7 mph",
        thespeed = nwsdata.properties.periods[i].windSpeed;
        if (thespeed.length < 7) {
            speedmin_act = thespeed.substring(0, thespeed.indexOf("mph"));
            speedmax_act = thespeed.substring(0, thespeed.indexOf("mph"));
        } else {
            speedmin_act = thespeed.substring(0, thespeed.indexOf("to"));
            speedmax_actarray = thespeed.match("to(.*)mph");
            speedmax_act = speedmax_actarray[1];
        }
        speedmin_act = parseInt(speedmin_act);
        speedmax_act = parseInt(speedmax_act);
        // almost always speedmin_act = speedmax_act
        // console.log("speedmin_act "+speedmin_act+" speedmax_act "+speedmax_act);

        // get the wind direction, ex.  "windDirection": "SW"
        thedirection = nwsdata.properties.periods[i].windDirection;

        // look at the shortForecast for rain, it is described in many ways
        therain = nwsdata.properties.periods[i].shortForecast;

        // Create a 7 day array with [day, color]
        // Ex.  [[Mo, green], [Tu, blue], [We, yellow], etc]

        // at 00 the day is completed, so add up for previous day and color
        if (inthour === 23) {
            // var tagtime = nwsdata.properties.periods[i - 1].startTime;
            // tagdate = tagtime.substring(0, 10);

            // console.log(name + " greeno: "+greeno+", yellowo: "+yellowo)

            // set the day in the array colorresult
            colorresult[arrayposition][0] = weekday[todaynum];

                // GREEN day
                if (greeno >= 4) {
                    if (rain_score < 5) {
                        colorresult[arrayposition][1] = "go-green";
                    } else {
                        colorresult[arrayposition][1] = "go-lightgreen-blue";
                    }
                }
                // LIGHT GREEN day
                else if (greeno === 1 || greeno === 2 || greeno === 3) {
                    if (rain_score < 5) {
                        colorresult[arrayposition][1] = "go-lightgreen";
                    } else {
                        colorresult[arrayposition][1] = "go-lightgreen-blue";
                    }
                }
                // YELLOW day
                else if (yellowo >= 2) {
                    if (rain_score < 5) {
                        colorresult[arrayposition][1] = "go-yellow";
                    } else {
                        colorresult[arrayposition][1] = "go-yellow-blue";
                    }
                }
                // GRAY day
                else {
                    if (rain_score < 5) {
                        colorresult[arrayposition][1] = "go-gray";
                    } else {
                        colorresult[arrayposition][1] = "go-gray";
                    }
                }

            arrayposition++;

            // todaynum is 0 (sunday) to 6 (saturday)
            todaynum++;
            if (todaynum === 7) {
                todaynum = 0; // set it back to Sunday
            }

            // reset colors for next day period
            greeno = 0;
            yellowo = 0;
            rain_score = 0;

            // incrementing colors depending on the days conditions
            // add colors for each out and then determine final color of day
        } else if (inthour >= hourstart && inthour <= hourend) {
            if (speedmin_act >= speedmin_ideal && speedmax_act <= speedmax_ideal && dir_ideal.indexOf(thedirection) > -1) {
                // console.log(name + " GREEN: T=" + inthour + "(" + timestr + "), thespeed: " + thespeed + ", ideal:" + speedmin_ideal + "-" + speedmax_ideal +" edge: " + speedmin_edge + "-" + speedmax_edge + ', ' + thedirection + ", day " + weekday[todaynum]);
                greeno = greeno + 1;
                yellowo = yellowo + 1;
                // console.log ("1");
            } else if (speedmin_act >= speedmin_edge && speedmax_act <= speedmax_edge && dir_edge.indexOf(thedirection) > -1) {
                // console.log(name + " YELLOW: T=" + inthour + "(" + timestr + "), thespeed:" + thespeed + ", ideal:" + speedmin_ideal + "-" + speedmax_ideal +" edge: " + speedmin_edge + "-" + speedmax_edge + ', ' +thedirection + ", day " + weekday[todaynum]);
                yellowo = yellowo + 1;
                // console.log ("2");
            } else if (speedmax_act <= 5 && lightwind_ok === "yes") {
                // console.log(name + " LIGHTWIND OK: T=" + inthour + "(" + timestr + "), thespeed:" + thespeed + ", ideal:" + speedmin_ideal + "-" + speedmax_ideal +" edge: " + speedmin_edge + "-" + speedmax_edge + ', ' +thedirection + ", day " + weekday[todaynum]);
                yellowo = yellowo + 1;
                // console.log ("3");
            } else {
                // console.log(name + " GRAY: T=" + inthour + "(" + timestr + "), thespeed:" + thespeed + ", ideal:" + speedmin_ideal + "-" + speedmax_ideal +" edge: " + speedmin_edge + "-" + speedmax_edge + ', ' +thedirection + ", day " + weekday[todaynum]);
            }

            // NWS describes Rain and Snow in many ways
            // graphical.weather.gov/xml/xml_fields_icon_weather_conditions.php weatherterms
            if (
                therain === "Rain" ||
                therain === "Rain Showers" ||
                therain === "Rain Showers Likely" ||
                therain === "Light Rain Likely" ||
                therain === "Rain Likely" ||
                therain === "Light Rain" ||
                therain === "Showers And Thunderstorms Likely" ||
                therain === "Showers And Thunderstorms" ||
                therain === "Heavy Snow" ||
                therain === "Snow Likely" ||
                therain === "Snow Showers" ||
                therain === "Snow Showers Likely" ||
                therain === "Heavy Rain" ||
                therain === "Chance Showers And Thunderstorms"
            ) {
                rain_score = rain_score + 1;
            }
        }
    } // end the 156 hour loop

    // console.log(name + "   colorcalc: " + colorresult);
    return colorresult;
    // return JSON.stringify(colorresult);
};
