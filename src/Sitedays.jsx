/*
 *  These are the site color boxes
 */

import { FetchJson } from "./FetchJson.jsx";

const Sitedays = ({ id, sitename, station, grid_x, grid_y, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge }) => {
    // get NWS API data for each site, daycolors array ex. [['Mo','go-green'], ['Tu','go-yellow'], etc]
    const daycolors = FetchJson(id, sitename, station, grid_x, grid_y, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge);

    // get todays day in the format Mo, Tu etc
    const todaysDay = new Date().toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);

    // store the color results locally
    // helpful if the server is temporarily down with a 503 error
    if (Array.isArray(daycolors) && daycolors.length > 0) {
        // Perform actions if daycolors is an array starting with today
        if (daycolors[0][0] === todaysDay) {
            // Store the data locally if the variable is an array (a valid result)
            localStorage.setItem("id" + id, JSON.stringify(daycolors));
            // console.log(sitename + " was stored locally :" + daycolors);
        }
    }

    return (
        <div>
            {daycolors.map((daycolor, i) => (
                <div className={daycolor[1]} key={i}>
                    {daycolor[0]}
                </div>
            ))}
        </div>
    );
};

export default Sitedays;
