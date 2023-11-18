/*
*   Displays one site row
*/

import Sitename from "./Sitename";
import Sitedays from "./Sitedays";
import Nwsimage from "./Nwsimage";
import Linkforecasts from "./Linkforecasts";
import Linkcurrent from "./Linkcurrent";
import Linkdata from "./Linkdata";
import { useState } from "react";

const Arow = ({ arraydata }) => {

    // when info button is clicked, show info panel
    const [isOpen, setIsOpen] = useState(0);

    // toggle the open and close of bottom links
    function toggle(dataid) {
        if(dataid === isOpen) {
            setIsOpen(0);
        } else {
          setIsOpen(dataid);
        }
    }

    return (
        <div>
            {arraydata.map((data) => (
                <div className="siterow" key={data.id}>
                    <div className="toprow" onClick={e => toggle(data.id)}>
                        <div className="title_blue" id={data.id}>
                            <Sitename id={data.id} sitename={data.sitename} />
                        </div>
                        <div className="daycolors">
                            <Sitedays sitename={data.sitename} station={data.station} grid_x={data.grid_x} grid_y={data.grid_y}
                            hourstart={data.hourstart} hourend={data.hourend} speedmin_ideal={data.speedmin_ideal} speedmax_ideal={data.speedmax_ideal}
                            speedmin_edge={data.speedmin_edge} speedmax_edge={data.speedmax_edge} lightwind_ok={data.lightwind_ok} dir_ideal={data.dir_ideal} dir_edge={data.dir_edge} />
                        </div>
                    </div>
                    {data.id === isOpen && (
                        <div>
                            <div className="linkmap" onClick={e => toggle(data.id)}>
                                <Nwsimage id={data.id} nws_image={data.nws_image} />
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
