/*

Developer notes:

Using NWS point forecasts, this calculates if paragliding wind conditions are good

NWS API https://www.weather.gov/documentation/services-web-api

Start with Lat, Lon to get the Station and Grid X, Y
https://api.weather.gov/points/37.674,-122.495

"forecastHourly" is in the response (used for Wind info)
https://api.weather.gov/gridpoints/MTR/84,122/forecast/hourly

"forecastGridData" is in the response (used for Lift info) - not used currently
https://api.weather.gov/gridpoints/MTR/104,152 (

*/


/*
*
*  The function updateMysql updates the MySQL table with new JSON wind forecast
*
*/
function updateMysql(wind_forecast, gridX, gridY, station, site) {
    $.ajax({
        url: "https://www.gerrypez.com/pg/weather/nws_update_mysql.php",
        method: "POST",
        // dataType: "json",  php does the json encode
        data: {
            wind_forecast : wind_forecast,
            gridX : gridX,
            gridY : gridY,
            station : station,
            site : site
        },
        success: function (response) {
            console.log(site + " 3. [updateMysql] success");
         },
         error: function(jqXHR, textStatus, errorThrown) {
            console.log(site + " 3. [updateMysql] error "+ textStatus + errorThrown);
         }
    }); // end ajax POST
} // end updateMysql function

/*
*
* API to NWS to get current JSON, then calls updateMysql
*
*/
function getAPIdata (site, gridX, gridY, station, mysql_date) {
    var urlcalled = "https://api.weather.gov/gridpoints/" + station + "/" + gridX + "," + gridY + "/forecast/hourly";
    console.log(site + " 2. [getAPIdata] urlcalled was " + urlcalled);
    $.ajax({
        url: "https://api.weather.gov/gridpoints/" + station + "/" + gridX + "," + gridY + "/forecast/hourly",
        dataType: "json",
        tryCount : 0,
        retryLimit : 4,
        success: function (response) {
            // response is JSON format, it is stringed to send to the web server
            var wind_forecast = JSON.stringify(response);
            var api_date = new Date(response.properties.updated); // date of last forecast
            var todaysdate = new Date();

            if (api_date > mysql_date) {
                updateMysql(wind_forecast, gridX, gridY, station, site);
                console.log (site + " 2. [getAPIdata] API date is new and improved, so [updateMysql]");
            }

            if (mysql_date > todaysdate) {
                updateMysql(wind_forecast, gridX, gridY, station, site);
                console.log (site + " 2. [getAPIdata] mysql_date is future ??, so [updateMysql]");
            }

            hours_old = parseInt(Math.abs(mysql_date - todaysdate) / 36e5);
            days_old = parseInt(hours_old/24);
            // color pink if mysql_date too old
            if(hours_old > 48) {
                console.log (site + " 2. [getAPIdata] mysql_date > 48hrs so pink");
                sitename = site+"_name";
                $('#'+sitename).css('color', 'pink');
            }
        },
        error : function(xhr, textStatus, errorThrown) {
            console.log(site + " [getAPIdata] error "+textStatus);
            // server timeout so retry up to 4x (ref: https://bit.ly/2NXw8Ug)
            if (textStatus === "timeout" || textStatus === "error" ) {
                this.tryCount++;
                if (this.tryCount == this.retryLimit) {
                    sitename = site+"_name";
                    console.log (site + " [getAPIdata] 4x error");
                }
                if (this.tryCount <= this.retryLimit) {
                    console.log(site + " [getAPIdata] re-try # " + this.tryCount);
                    setTimeout(() => {
                        $.ajax(this);
                    }, 3000);
                    return;
                }
            return;
            }
        }
    }); // end ajax json
} // end get Wind function



/*
*
*  The function getMysql gets wind data stored in MySQL, checks wind conditions, colors boxes.
*  The NWS API is sometimes slow and unreliable, so that is why MySQL storage is used for the JSON data.
*
*/
function getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok) {
    $.ajax({
        url     : "nws_get_mysql.php", // gets json from database
        dataType: "json",
        method  : "POST",
        data    : {
            gridX : gridX,
            gridY : gridY,
            station : station,
            site : site
        },
        tryCount : 0,
        retryLimit : 8,
        success : function(response){

            // declare variables
            var therow = "";
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
            var i = 0;
            var intoffset = 7;
            var inthour = 0;
            var tagdate = "2021-01-01";
            var sitename = "";
            var days_old = 0;
            var hours_old = 0;

            // determine what day of the week it is today
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

            // Looking at the model date in MySQL table
            var mysql_date = new Date(response.properties.updated);

            // for now update every site, every time page is opened
            console.log(site + " 1. [getMysql] mysql_date " + mysql_date);
            getAPIdata (site, gridX, gridY, station, mysql_date);

            // there are always 156 hour periods (0 to 155), but to be sure I check the length
            var countperiods = Object.keys(response.properties.periods).length;  // = 156

            // loop through each hour period (there are 155 hour periods) to collect number of good hours
            for (i = 0; i < countperiods; i++) {

                // get thehour for the data block
                // the hour in this case is 16 with a -7 offset
                timestr = response.properties.periods[i].startTime;  // 2022-09-09T13:00:00-07:00
                thehour = timestr.substring(11,13); // 16
                isutc = timestr.substring(20,22); //  07 for PT, 00 for UTC return

                // convert from string to integer
                intoffset = parseInt(isutc); // 07 becomes the integer 7
                inthour = parseInt(thehour);

                if (site=="dunlap") {console.log(site+" thehour "+inthour);}
                if (site=="st_helena") {console.log(site+" thehour "+inthour);}

                // convert UTC to PT ... currently no sites show time in UTC so not needed
                if (isutc === "00") {
                    // time is in UTC, so subtract offset for PT
                    console.log('isutc for site '+site);
                    inthour = inthour - intoffset;
                    if (inthour < 0) {
                        inthour = inthour + 24;
                    }
                }

                // get the wind speed range
                thespeed = response.properties.periods[i].windSpeed;
                if (thespeed.length < 7) {
                    speedmin_act = thespeed.substring(0,thespeed.indexOf("mph"));
                    speedmax_act = thespeed.substring(0,thespeed.indexOf("mph"));
                } else {
                    speedmin_act = thespeed.substring(0,thespeed.indexOf("to"));
                    speedmax_actarray = thespeed.match("to(.*)mph");
                    speedmax_act = speedmax_actarray[1];
                }
                speedmin_act = parseInt(speedmin_act);
                speedmax_act = parseInt(speedmax_act);

                // get the wind direction
                thedirection = response.properties.periods[i].windDirection;

                // at 00 the day is completed, so add up for previous day and color the box ..
                if (inthour == 23) {

                    var tagtime = response.properties.periods[i-1].startTime;
                    tagdate = tagtime.substring(0,10);

                    if (greeno >= 4) {
                        therow = therow.concat('<div class="go-green" id="'+site+tagdate+'">'+weekday[todaynum]+'</div>');

                        // special marker for rare sites
                        if (site == 'drakes') { $('#drakes_name').css('background-color', 'green'); }
                        if (site == 'grade') { $('#grade_name').css('background-color', 'green'); }


                    } else if (greeno==1 || greeno == 2 || greeno == 3) {
                        therow = therow.concat('<div class="go-greenyellow" id="'+site+tagdate+'">'+weekday[todaynum]+'</div>');
                    } else if (yellowo >= 3) {
                        therow = therow.concat('<div class="go-yellow" id="'+site+tagdate+'">'+weekday[todaynum]+'</div>');
                    } else {
                        therow = therow.concat('<div class="go-red">'+weekday[todaynum]+'</div>');
                    }

                    todaynum++;
                    if (todaynum == 7) { todaynum = 0; } // loop on Sunday

                    // reset green, yellow for next day period
                    greeno = 0;
                    yellowo = 0;

                // incrementing colors depending on the days conditions
                } else if (inthour >= hourstart && inthour <= hourend) {
                    if ((speedmin_act >= speedmin_ideal && speedmax_act <= speedmax_ideal) && (jQuery.inArray(thedirection, dir_ideal) !== -1)) {
                        console.log(site+" [getMysql] green: T="+inthour+"("+timestr+"), windspeed "+thespeed+", direction "+thedirection+", day "+weekday[todaynum]);
                        greeno = greeno+1;
                        yellowo = yellowo+1;
                    } else if ((speedmin_act >= speedmin_edge && speedmax_act <= speedmax_edge) && (jQuery.inArray(thedirection, dir_edge) !== -1)) {
                        console.log(site+" [getMysql] yellow: T="+inthour+"("+timestr+"), windspeed "+thespeed+", direction "+thedirection+", day "+weekday[todaynum]);
                        yellowo = yellowo + 1;
                    } else if ( speedmax_act <= 4 && lightwind_ok == "yes") {
                        console.log(site+" light wind,[getMysql] yellow: T="+inthour+"("+timestr+"), windspeed "+thespeed+",  <= 3mph direction not important "+thedirection+", day "+weekday[todaynum]);
                        yellowo = yellowo + 1;
                    } else {
                        console.log(site+" [getMysql] red: T="+inthour+"("+timestr+"), windspeed "+thespeed+", direction "+thedirection+", day "+weekday[todaynum]);
                    }
                }

            } // end if for 155 for loop

            $("#"+site).append(therow);

        }, // end success
        error: function(jqXHR, textStatus, errorThrown) {
           console.log(site + " [getMysql]  error");
           // retry
           this.tryCount++;
           if (this.tryCount <= this.retryLimit) {
               console.log(site + " [getMysql]  error "+textStatus+" - re-trying number " + this.tryCount);
               // wait 1 second before retrying to read MySQL table
                setTimeout(() => {
                    $.ajax(this);
                }, 2000);
               // $.ajax(this);
               return;
           }
        }
    }); // end of ajax call

} // end of getMysql function


/*
*
*  this looks at MySQL field write_date, php returns # hours old
*  only refresh one time (use localStorage to check)
*/
function refreshIfOld () {
    var hours_old = 0;
    console.log(" [refreshIfOld] running refreshIfOld function");
    $.ajax({
        url: 'nws_checkhowold.php',
        type:'POST',
        success: function(data)
        {
            // this is the latest database write (write_date)
            hours_old = parseInt(data);
            if (hours_old > 4 && !localStorage.getItem('firstLoad')) {
                $(".baptitle").text("Updating ... ");
                localStorage['firstLoad'] = true;
                console.log(" [refreshIfOld] triggered, hours old = " + hours_old);
                setTimeout(function() {
                    location.reload();
                }, 8000);
            } else {
                localStorage.removeItem('firstLoad');
                console.log(" [refreshIfOld] not needed, hours old = " + hours_old);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(" [refreshIfOld] error");
        }
    });
} // end checkHowOld function


$(document).ready(function() {

    // Make button and rows active
    $(".infobutton").click(function(){
        $(".infopanel").slideToggle("slow");
    });

    // Temp button fill in fields
    $(".sitebox").click(function(e) {
        $(this).find(".nws_image_box").toggle("slow");
        $(this).find(".morestuff").toggle("slow");
    });

    var site = "";
    var station = "";
    var gridX = 0;
    var gridY = 0;
    var lat = 0;
    var lng = 0;
    var hourstart = 0;
    var hourend = 0;
    var speedmin_ideal = 0;
    var speedmax_ideal = 0;
    var speedmin_edge = 0;
    var speedmax_edge = 0;
    var dir_ideal = [];
    var dir_edge = [];

    site = "bidwell";
    lat = 39.7802;
    lng = -121.761;
    station = "STO";
    gridX = 41;
    gridY = 122;
    hourstart = 10;
    hourend = 20;
    speedmin_ideal = 7;
    speedmax_ideal = 12;
    speedmin_edge = 6;
    speedmax_edge = 16;
    lightwind_ok = "no";
    dir_ideal = ["SSE", "SE", "ESE"];
    dir_edge = ["S", "SSE", "SE", "ESE", "E"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "big_sur";
    lat = 35.971;
    lng = -121.453;
    station = "MTR";
    gridX = 103;
    gridY = 19;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 2;
    speedmax_ideal = 8;
    speedmin_edge = 0;
    speedmax_edge = 11;
    lightwind_ok = "yes";
    dir_ideal = ["SW", "WSW", "W"];
    dir_edge = ["SSW", "SW", "WSW", "W", "WNW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "berkeley";
    lat = 37.871;
    lng = -122.319;
    station = "MTR";
    gridX = 89;
    gridY = 109;
    hourstart = 11;
    hourend = 18;
    speedmin_ideal = 7;
    speedmax_ideal = 10;
    speedmin_edge = 6;
    speedmax_edge = 11;
    lightwind_ok = "no";
    dir_ideal = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    dir_edge = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "blue_rock";
    lat = 38.1384;
    lng = -122.1959;
    station = "STO";
    gridX = 12;
    gridY = 53;
    hourstart = 10;
    hourend = 19;
    speedmin_ideal = 8;
    speedmax_ideal = 11;
    speedmin_edge = 6;
    speedmax_edge = 15;
    lightwind_ok = "no";
    dir_ideal = ["WSW", "W", "WNW"];
    dir_edge = ["SW", "WSW", "W", "WNW", "NW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "channing";
    lat = 38.098;
    lng = -122.180;
    station = "STO";
    gridX = 12;
    gridY = 51;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 8;
    speedmax_ideal = 12;
    speedmin_edge = 6;
    speedmax_edge = 18;
    lightwind_ok = "no";
    dir_ideal = ["WSW", "W", "WNW"];
    dir_edge = ["SW", "WSW", "W", "WNW", "NW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "channing_east";
    lat = 38.099;
    lng = -122.180;
    station = "STO";
    gridX = 12;
    gridY = 51;
    hourstart = 10;
    hourend = 19;
    speedmin_ideal = 4;
    speedmax_ideal = 9;
    speedmin_edge = 3;
    speedmax_edge = 12;
    lightwind_ok = "no";
    dir_ideal = ["ENE", "E", "ESE"];
    dir_edge = ["NE", "ENE", "E", "ESE", "SE"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "coloma";
    lat = 38.822;
    lng = -120.889;
    station = "STO";
    gridX = 63;
    gridY = 74;
    hourstart = 11;
    hourend = 18;
    speedmin_ideal = 0;
    speedmax_ideal = 10;
    speedmin_edge = 0;
    speedmax_edge = 12;
    lightwind_ok = "yes";
    dir_ideal = ["WSW", "W", "WNW"];
    dir_edge = ["S","SW", "WSW", "W", "WNW", "NW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "davis";
    lat = 38.570;
    lng = -121.820;
    station = "STO";
    gridX = 29;
    gridY = 69;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 7;
    speedmax_ideal = 10;
    speedmin_edge = 6;
    speedmax_edge = 12;
    lightwind_ok = "no";
    dir_ideal = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    dir_edge = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "diablo_juniper";
    lat = 37.881;
    lng = -121.914;
    station = "MTR";
    gridX = 103;
    gridY = 106;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 0;
    speedmax_ideal = 8;
    speedmin_edge = 0;
    speedmax_edge = 14;
    lightwind_ok = "yes";
    dir_ideal = ["SSW","SW", "WSW"];
    dir_edge = ["S", "SW", "WSW", "W"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "diablo_towers";
    lat = 37.881;
    lng = -121.914;
    station = "MTR";
    gridX = 103;
    gridY = 106;
    hourstart = 11;
    hourend = 18;
    speedmin_ideal = 3;
    speedmax_ideal = 8;
    speedmin_edge = 3;
    speedmax_edge = 11;
    lightwind_ok = "no";
    dir_ideal = ["WNW", "NW", "NNW"];
    dir_edge = ["W", "WNW", "W", "NW", "NNW", "N"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "drakes";
    lat = 38.0265;
    lng = -122.9634;
    station = "MTR";
    gridX = 68;
    gridY = 120;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 8;
    speedmax_ideal = 12;
    speedmin_edge = 7;
    speedmax_edge = 20;
    lightwind_ok = "no";
    dir_ideal = ["SE", "SSE"];
    dir_edge = ["ESE", "SE", "SSE", "S"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "dunlap";
    lat = 36.765;
    lng = -119.098;
    station = "HNX";
    gridX = 77;
    gridY = 96;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 0;
    speedmax_ideal = 7;
    speedmin_edge = 0;
    speedmax_edge = 11;
    lightwind_ok = "yes";
    dir_ideal = ["WSW", "W", "WNW"];
    dir_edge = ["SW", "WSW", "W", "WNW", "NW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "ed_levin";
    lat = 37.475;
    lng = -121.861;
    station = "MTR";
    gridX = 101;
    gridY = 88;
    hourstart = 9;
    hourend = 18;
    speedmin_ideal = 0;
    speedmax_ideal = 8;
    speedmin_edge = 0;
    speedmax_edge = 14;
    lightwind_ok = "yes";
    dir_ideal = ["SSE", "S", "SSW", "SW", "WSW", "W", "WNW"];
    dir_edge = ["SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "elk";
    lat = 39.277;
    lng = -122.941;
    station = "EKA";
    gridX = 88;
    gridY = 30;
    hourstart = 11;
    hourend = 18;
    speedmin_ideal = 0;
    speedmax_ideal = 6;
    speedmin_edge = 0;
    speedmax_edge = 9;
    lightwind_ok = "yes";
    dir_ideal = ["ESE","SE","SSE","NW", "WNW"];
    dir_edge = ["ESE", "SE", "SSE", "S", "SSW", "SW", "WNW", "NW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "goat";
    lat = 38.443;
    lng = -123.122;
    station = "MTR";
    gridX = 66;
    gridY = 140;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 9;
    speedmax_ideal = 14;
    speedmin_edge = 8;
    speedmax_edge = 20;
    lightwind_ok = "no";
    dir_ideal = ["WSW", "W", "WNW"];
    dir_edge = ["SW", "WSW", "W", "WNW", "NW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "grade";
    lat = 38.478;
    lng = -123.163;
    station = "MTR";
    gridX = 65;
    gridY = 142;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 7;
    speedmax_ideal = 12;
    speedmin_edge = 7;
    speedmax_edge = 18;
    lightwind_ok = "no";
    dir_ideal = ["SSW", "SW", "WSW"];
    dir_edge = ["SSE", "S", "SSW", "SW", "WSW", "W"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "hat_creek";
    lat = 40.842;
    lng = -121.428;
    station = "STO";
    gridX = 62;
    gridY = 167;
    hourstart = 15;
    hourend = 19;
    speedmin_ideal = 5;
    speedmax_ideal = 9;
    speedmin_edge = 3;
    speedmax_edge = 15;
    lightwind_ok = "no";
    dir_ideal = ["WSW", "W", "WNW"];
    dir_edge = ["SW", "WSW", "W", "WNW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "hull";
    lat = 39.509;
    lng = -122.937;
    station = "EKA";
    gridX = 91;
    gridY = 40;
    hourstart = 11;
    hourend = 18;
    speedmin_ideal = 2;
    speedmax_ideal = 6;
    speedmin_edge = 0;
    speedmax_edge = 8;
    lightwind_ok = "yes";
    dir_ideal = ["SSW", "SW", "WSW"];
    dir_edge = ["S", "SSW", "SW", "WSW", "W"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "indianvalley";
    lat = 40.194;
    lng = -120.923;
    station = "REV";
    gridX = 12;
    gridY = 142;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 3;
    speedmax_ideal = 7;
    speedmin_edge = 0;
    speedmax_edge = 9;
    lightwind_ok = "yes";
    dir_ideal = ["SSW", "SW", "WSW"];
    dir_edge = ["S", "SSW", "SW", "WSW", "W"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "lagoonkite";
    lat = 38.333;
    lng = -122.002;
    station = "STO";
    gridX = 20;
    gridY = 60;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 7;
    speedmax_ideal = 11;
    speedmin_edge = 6;
    speedmax_edge = 13;
    lightwind_ok = "no";
    dir_ideal = ["S", "SSW","SW", "WSW", "W", "WNW","NW", "NNW"];
    dir_edge = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "lagoon";
    lat = 38.333;
    lng = -122.002;
    station = "STO";
    gridX = 20;
    gridY = 60;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 6;
    speedmax_ideal = 11;
    speedmin_edge = 1;
    speedmax_edge = 14;
    lightwind_ok = "no";
    dir_ideal = ["SW", "WSW", "W", "WNW"];
    dir_edge = ["SSW", "SW", "WSW", "W", "WNW", "NW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "musselrock";
    lat = 37.674;
    lng = -122.495;
    station = "MTR";
    gridX = 81;
    gridY = 101;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 9;
    speedmax_ideal = 15;
    speedmin_edge = 8;
    speedmax_edge = 20;
    lightwind_ok = "no";
    dir_ideal = ["W", "WNW", "NW"];
    dir_edge = ["SW", "WSW", "W", "WNW", "NW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "musselkite";
    lat = 37.674;
    lng = -122.495;
    station = "MTR";
    gridX = 81;
    gridY = 101;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 6;
    speedmax_ideal = 15;
    speedmin_edge = 8;
    speedmax_edge = 18;
    lightwind_ok = "no";
    dir_ideal = ["SW", "WSW", "W", "WNW", "NW"];
    dir_edge = ["SW", "WSW", "W", "WNW", "NW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);


    site = "mt_tam";
    lat = 37.911;
    lng = -122.625;
    station = "MTR";
    gridX = 79;
    gridY = 113;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 2;
    speedmax_ideal = 8;
    speedmin_edge = 0;
    speedmax_edge = 12;
    lightwind_ok = "yes";
    dir_ideal = ["S", "SSW", "SW", "WSW", "W"];
    dir_edge = ["SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "mission";
    lat = 37.518;
    lng = -121.892;
    station = "MTR";
    gridX = 101;
    gridY = 90;
    hourstart = 11;
    hourend = 18;
    speedmin_ideal = 0;
    speedmax_ideal = 9;
    speedmin_edge = 0;
    speedmax_edge = 14;
    lightwind_ok = "yes";
    dir_ideal = ["SW", "WSW", "W", "WNW", "NW", "NNW"];
    dir_edge = ["SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N", "NNE"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "oroville";
    lat = 39.537;
    lng = -121.628;
    station = "STO";
    gridX = 44;
    gridY = 111;
    hourstart = 11;
    hourend = 18;
    speedmin_ideal = 7;
    speedmax_ideal = 10;
    speedmin_edge = 6;
    speedmax_edge = 12;
    lightwind_ok = "no";
    dir_ideal = ["N", "NNW"];
    dir_edge = ["N", "NNE", "NNW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "poplar";
    lat =  37.4554;
    lng = -122.4447;
    station = "MTR";
    gridX = 81;
    gridY = 91;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 8;
    speedmax_ideal = 13;
    speedmin_edge = 8;
    speedmax_edge = 18;
    dir_ideal = ["WSW", "W", "WNW"];
    dir_edge = ["SW", "WSW", "W", "WNW", "NW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "potato";
    lat = 39.3317;
    lng = -122.685;
    station = "STO";
    gridX = 6;
    gridY = 109;
    hourstart = 8;
    hourend = 13;
    speedmin_ideal = 0;
    speedmax_ideal = 5;
    speedmin_edge = 0;
    speedmax_edge = 10;
    lightwind_ok = "yes";
    dir_ideal = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    dir_edge = ["NE", "ENE", "E", "ESE", "SE", "S"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "sandybeach";
    lat =  38.0772;
    lng = -122.2398;
    station = "STO";
    gridX = 10;
    gridY = 50;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 9;
    speedmax_ideal = 13;
    speedmin_edge = 7;
    speedmax_edge = 18;
    lightwind_ok = "no";
    dir_ideal = ["WSW", "W"];
    dir_edge = ["SW", "WSW", "W", "WNW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "sand_city";
    lat = 36.626;
    lng = -121.844;
    station = "MTR";
    gridX = 95;
    gridY = 51;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 9;
    speedmax_ideal = 12;
    speedmin_edge = 7;
    speedmax_edge = 18;
    lightwind_ok = "no";
    dir_ideal = ["W","WNW", "NW"];
    dir_edge = ["SW", "WSW", "W", "WNW", "NW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "shoreline";
    lat = 37.430;
    lng = -122.076;
    station = "MTR";
    gridX = 94;
    gridY = 88;
    hourstart = 9;
    hourend = 19;
    speedmin_ideal = 7;
    speedmax_ideal = 11;
    speedmin_edge = 5;
    speedmax_edge = 13;
    dir_ideal = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    dir_edge = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "slide";
    lat = 39.319;
    lng = -119.867;
    station = "REV";
    gridX = 40;
    gridY = 96;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 2;
    speedmax_ideal = 6;
    speedmin_edge = 0;
    speedmax_edge = 10;
    lightwind_ok = "no";
    dir_ideal = ["ENE", "E", "ESE"];
    dir_edge = ["NE", "ENE", "E", "ESE", "SE", "S"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "st_helena";
    lat = 38.667;
    lng = -122.628;
    station = "MTR";
    gridX = 86;
    gridY = 146;
    hourstart = 11;
    hourend = 18;
    speedmin_ideal = 6;
    speedmax_ideal = 12;
    speedmin_edge = 4;
    speedmax_edge = 15;
    dir_ideal = ["SW", "WSW"];
    dir_edge = ["S", "SSW", "SW", "WSW", "W"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "stoneman";
    lat = 38.0047;
    lng = -121.9201;
    station = "MTR";
    gridX = 104;
    gridY = 112;
    hourstart = 10;
    hourend = 17;
    speedmin_ideal = 7;
    speedmax_ideal = 12;
    speedmin_edge = 6;
    speedmax_edge = 16;
    lightwind_ok = "no";
    dir_ideal = ["ENE", "E", "ESE", "SSW", "SW", "WSW", "NNW", "N", "NNE"];
    dir_edge = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "tollhouse";
    lat = 37.015;
    lng = -119.373;
    station = "HNX";
    gridX = 69;
    gridY = 109;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 3;
    speedmax_ideal = 7;
    speedmin_edge = 0;
    speedmax_edge = 10;
    lightwind_ok = "yes";
    dir_ideal = ["SW", "WSW", "W"];
    dir_edge = ["SSW", "SW", "WSW", "W", "WNW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "vacaridge";
    lat = 38.400;
    lng = -122.106;
    station = "MTR";
    gridX = 101;
    gridY = 131;
    hourstart = 11;
    hourend = 17;
    speedmin_ideal = 5;
    speedmax_ideal = 10;
    speedmin_edge = 0;
    speedmax_edge = 16;
    lightwind_ok = "no";
    dir_ideal = ["SW", "WSW", "W"];
    dir_edge = ["SSW", "SW", "WSW", "W", "WNW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "vallejo";
    lat = 38.1451;
    lng = -122.2649;
    station = "STO";
    gridX = 9;
    gridY = 53;
    hourstart = 11;
    hourend = 19;
    speedmin_ideal = 7;
    speedmax_ideal = 11;
    speedmin_edge = 6;
    speedmax_edge = 14;
    lightwind_ok = "no";
    dir_ideal = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    dir_edge = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "dillon";
    lat = 38.0643;
    lng = -122.1981;
    station ="STO";
    gridX = 11;
    gridY = 49;
    hourstart = 11;
    hourend = 19;
    speedmin_ideal = 7;
    speedmax_ideal = 11;
    speedmin_edge = 6;
    speedmax_edge = 16;
    lightwind_ok = "no";
    dir_ideal = ["SSW", "SW", "WSW", "W", "WNW"];
    dir_edge = ["SSW", "SW", "WSW", "W", "WNW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "crissy";
    lat = 37.8039;
    lng = -122.4627;
    station = "MTR";
    gridX = 84;
    gridY = 106;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 7;
    speedmax_ideal = 13;
    speedmin_edge = 7;
    speedmax_edge = 18;
    lightwind_ok = "no";
    dir_ideal = ["N", "NNE", "NE", "WSW", "W", "WNW", "NW", "NNW"];
    dir_edge = ["N", "NNE", "NE", "WSW", "W", "WNW", "NW", "NNW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "waddel";
    lat = 37.089;
    lng = -122.274;
    station = "MTR";
    gridX = 84;
    gridY = 74;
    hourstart = 12;
    hourend = 18;
    speedmin_ideal = 7;
    speedmax_ideal = 9;
    speedmin_edge = 7;
    speedmax_edge = 12;
    lightwind_ok = "no";
    dir_ideal = ["WSW", "W", "WNW"];
    dir_edge = ["WSW", "W", "WNW", "NW"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);

    site = "windy";
    lat = 37.364;
    lng = -122.245;
    station = "MTR";
    gridX = 87;
    gridY = 86;
    hourstart = 10;
    hourend = 18;
    speedmin_ideal = 2;
    speedmax_ideal = 6;
    speedmin_edge = 0;
    speedmax_edge = 10;
    lightwind_ok = "no";
    dir_ideal = ["NE", "ENE", "E"];
    dir_edge = ["NNE", "NE", "ENE", "E", "ESE", "SE"];
    getMysql(site, station, gridX, gridY, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge, lightwind_ok);


    // Check how old the MySQL data is, run API call if >4 hours old
    refreshIfOld();

    // this does many error checks
    // example -> checks if site json date is > 8 hours old
    $.get( "nws_errorcheck.php", function( data ) {
        $( ".error_message" ).append(data);
    });

}); // end document ready

