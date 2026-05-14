// Colorcalc: converts NWS hourly forecast JSON into an 8-element array of [day-label, color-class] pairs.
// Scores each hour in the flyable window against ideal/edge wind speed and direction thresholds.
// Color classes: go-green, go-lightgreen, go-yellow, go-gray, go-black, and *-blue rain variants.
//
export const Colorcalc = (nwsdata, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge) => {

    const colorresult = [["",""],["",""],["",""],["",""],["",""],["",""],["",""],["",""]];
    const weekday = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const now = new Date();
    const today_num = now.getDay();
    const currentHour = now.getHours();
    const countperiods = nwsdata.properties.periods.length;

    let green_total = 0;
    let yellow_total = 0;
    let rainscore = 0;
    let arrayposition = 0;
    let day_num = today_num;
    let currentDayOfWeek = -1;
    let lastHourOfCurrentDay = -1;

    function commitDay(todayDayOfWeek) {
        if (arrayposition >= colorresult.length) return;
        colorresult[arrayposition][0] = weekday[day_num];
        colorresult[arrayposition][1] = "go-gray";
        if (yellow_total >= 2 && rainscore <= 5) colorresult[arrayposition][1] = "go-yellow";
        if (yellow_total >= 2 && rainscore > 5)  colorresult[arrayposition][1] = "go-yellow-blue";
        if (green_total >= 1 && green_total <= 3) colorresult[arrayposition][1] = "go-lightgreen";
        if (green_total >= 1 && rainscore > 5) colorresult[arrayposition][1] = "go-lightgreen-blue";
        if (green_total >= 4) colorresult[arrayposition][1] = "go-green";
        if (green_total >= 4 && rainscore > 4) colorresult[arrayposition][1] = "go-lightgreen-blue";
        if (today_num === todayDayOfWeek && currentHour > 17) colorresult[arrayposition][1] = "go-black";
        arrayposition++;
        day_num = (day_num + 1) % 7;
        green_total = 0;
        yellow_total = 0;
        rainscore = 0;
    }

    for (let i = 0; i < countperiods; i++) {
        const period = nwsdata.properties.periods[i];
        const timestr = period.startTime;
        const api_hour = parseInt(timestr.substring(11, 13));
        const dayOfWeek = new Date(timestr).getDay();
        const nwswindspeed = parseInt(period.windSpeed);
        const thedirection = period.windDirection;
        const rainprob = parseInt(period.probabilityOfPrecipitation.value) || 0;

        // When the day changes, commit the previous day's scores
        if (currentDayOfWeek !== -1 && dayOfWeek !== currentDayOfWeek) {
            commitDay(currentDayOfWeek);
            lastHourOfCurrentDay = -1;
        }
        currentDayOfWeek = dayOfWeek;
        lastHourOfCurrentDay = api_hour;

        if (api_hour >= hourstart && api_hour <= hourend) {
            if (nwswindspeed >= speedmin_ideal && nwswindspeed <= speedmax_ideal && dir_ideal.includes(thedirection)) {
                green_total++;
                yellow_total++;
            } else if (nwswindspeed >= speedmin_edge && nwswindspeed <= speedmax_edge && dir_edge.includes(thedirection)) {
                yellow_total++;
            } else if (nwswindspeed <= 5 && lightwind_ok === "yes") {
                yellow_total++;
            }
            if (rainprob > 33) rainscore++;
        }
    }

    // Only commit the final day if NWS data covers through the end of the flying window.
    // A partial final day (e.g. only midnight–5AM) has no valid flying hours and would
    // always score gray, so skip it.
    if (currentDayOfWeek !== -1 && arrayposition < colorresult.length && lastHourOfCurrentDay >= hourend) {
        commitDay(currentDayOfWeek);
    }

    return colorresult;
};
