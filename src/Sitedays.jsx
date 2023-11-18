/*
*  These are the site color boxes
*/

import { FetchJson } from "./FetchJson.jsx";

const Sitedays = ({ sitename, station, grid_x, grid_y, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge }) => {

    // get NWS API data for each site
    // daycolors is an array variable like [['Mo','go-green'], ['Tu','go-yellow'], etc]
    const daycolors = FetchJson(sitename, station, grid_x, grid_y, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge);

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
