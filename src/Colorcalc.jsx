export const Colorcalc = (nwsdata, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge) => {
    var colorresult = [["",""],["",""],["",""],["",""],["",""],["",""],["",""]];

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

    var weekday = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Sa"];

    var d = new Date();
    var today_num = d.getDay();
    var day_num = today_num;
    var currentHour = d.getHours();

    var countperiods = Object.keys(nwsdata.properties.periods).length;

    for (i = 0; i < countperiods; i++) {
        timestr = nwsdata.properties.periods[i].startTime;
        api_hour = parseInt(timestr.substring(11, 13));

        const dateObject = new Date(timestr);
        const dayOfWeek = dateObject.getDay();

        thespeed = nwsdata.properties.periods[i].windSpeed;
        nwswindspeed = parseInt(thespeed.substring(0, thespeed.indexOf("mph")));

        thedirection = nwsdata.properties.periods[i].windDirection;

        rainprob = parseInt(nwsdata.properties.periods[i].probabilityOfPrecipitation.value);

        if (api_hour === 23) {
            colorresult[arrayposition][0] = weekday[day_num];
            colorresult[arrayposition][1] = "go-gray";
            if (yellow_total >= 2 && rainscore <= 5) colorresult[arrayposition][1] = "go-yellow";
            if (yellow_total >= 2 && rainscore > 5)  colorresult[arrayposition][1] = "go-yellow-blue";
            if (green_total >= 1 && green_total <= 3) colorresult[arrayposition][1] = "go-lightgreen";
            if (green_total >= 1 && rainscore > 5)   colorresult[arrayposition][1] = "go-lightgreen-blue";
            if (green_total >= 4)                    colorresult[arrayposition][1] = "go-green";
            if (green_total >= 4 && rainscore > 4)   colorresult[arrayposition][1] = "go-lightgreen-blue";
            if (today_num === dayOfWeek && currentHour > 17) colorresult[arrayposition][1] = "go-black";

            arrayposition++;
            day_num = (day_num + 1) % 7;
            green_total = 0;
            yellow_total = 0;
            rainscore = 0;

        } else if (api_hour >= hourstart && api_hour <= hourend) {
            if (nwswindspeed >= speedmin_ideal && nwswindspeed <= speedmax_ideal && dir_ideal.indexOf(thedirection) > -1) {
                green_total++;
                yellow_total++;
            } else if (nwswindspeed >= speedmin_edge && nwswindspeed <= speedmax_edge && dir_edge.indexOf(thedirection) > -1) {
                yellow_total++;
            } else if (nwswindspeed <= 5 && lightwind_ok === "yes") {
                yellow_total++;
            }
            if (rainprob > 33) rainscore++;
        }
    }

    return colorresult;
};
