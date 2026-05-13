// Arow: renders a list of site rows for one category (Local, Remote, or Kiting).
// Each row shows the site name and 7-day color boxes; clicking expands forecast links and the NWS meteogram.
//
import Sitename from "./Sitename";
import Sitedays from "./Sitedays";
import Nwsimage from "./Nwsimage";
import Linkforecasts from "./Linkforecasts";
import Linkcurrent from "./Linkcurrent";
import Linkdata from "./Linkdata";
import { useState } from "react";

const Arow = ({ arraydata, siteColors }) => {
    const [isOpen, setIsOpen] = useState(0);

    function toggle(dataid) {
        setIsOpen(dataid === isOpen ? 0 : dataid);
    }

    return (
        <div>
            {arraydata.map((data) => (
                <div className="siterow" key={data.id}>
                    <div className="toprow" onClick={() => toggle(data.id)}>
                        <Sitename id={data.id} sitename={data.sitename} />
                        <div className="daycolors">
                            <Sitedays
                                daycolors={siteColors ? (siteColors[String(data.id)] ?? []) : null}
                            />
                        </div>
                    </div>
                    {data.id === isOpen && (
                        <div>
                            <div className="linkmap" onClick={() => toggle(data.id)}>
                                <Nwsimage nws_image={data.nws_image} />
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
