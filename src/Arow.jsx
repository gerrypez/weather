/*
*   Displays one row (site), using the built React components
*/

import Sitename from "./Sitename";
import Sitedays from "./Sitedays";
import Linkmap from "./Linkmap";
import Linkforecasts from "./Linkforecasts";
import Linkcurrent from "./Linkcurrent";
import Linkdata from "./Linkdata";
import { useState } from "react";

const Arow = ({ arraydata }) => {

    // when info button is clicked, show info panel
    const [show, setShow] = useState(false);

    // onClick={() => setRowShow(data.id)}

    return (
        <div>
            {arraydata.map((data) => (
                <div className="siterow" key={data.id}>
                    <div className="toprow" onClick={() => setShow(data.id)}>
                        <div className="title_blue" id={data.id}>
                            <Sitename id={data.id} name={data.name} />
                        </div>
                        <div className="daycolors">
                            <Sitedays name={data.name} station={data.station} grid_x={data.grid_x} grid_y={data.grid_y}
                            hourstart={data.hourstart} hourend={data.hourend} speedmin_ideal={data.speedmin_ideal} speedmax_ideal={data.speedmax_ideal}
                            speedmin_edge={data.speedmin_edge} speedmax_edge={data.speedmax_edge} lightwind_ok={data.lightwind_ok} dir_ideal={data.dir_ideal} dir_edge={data.dir_edge} />
                        </div>
                    </div>
                    {show === data.id && (
                        <div>
                            <div className="linkmap" onClick={() => setShow(0)}>
                                <Linkmap id={data.id} nws_image={data.nws_image} />
                            </div>
                            <div className="morestuff">
                                <Linkforecasts link_forecasts={data.link_forecasts} />
                                <Linkcurrent link_current={data.link_current} />
                                <Linkdata link_data={data.link_data} />
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Arow;
