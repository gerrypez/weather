/*
 *  These are the site color boxes
 */

import { FetchJson } from "./FetchJson.jsx";

const Sitedays = ({ id, sitename, station, grid_x, grid_y, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge }) => {

    // get NWS API data for each site, daycolors array ex. [['Mo','go-green'], ['Tu','go-yellow'], etc]
    const daycolors = FetchJson(id, sitename, station, grid_x, grid_y, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge);

    // store results locally, in case there are future API 503 errors
    localStorage.setItem('id'+id, JSON.stringify(daycolors));

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
