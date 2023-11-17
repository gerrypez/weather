import { FetchJson } from "./FetchJson.jsx";

const Sitedays = ({ name, station, grid_x, grid_y, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge }) => {
    // don't get results from Arraydata.jsx
    // instead get it from FetchJson and Colorcalc

    // get NWS data for each site
    const daycolors = FetchJson(name, station, grid_x, grid_y, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, lightwind_ok, dir_ideal, dir_edge);

    // console.log('daycolors return:'+daycolors);

    return (

        <div>
            {daycolors.map((daycolor) => (
                    <div className={daycolor[1]} key={daycolor.id}>
                        {daycolor[0]}
                    </div>
                ))}
        </div>

    );
};

export default Sitedays;
