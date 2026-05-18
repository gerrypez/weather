// Allrows: top-level layout component that loads the weather cache and renders all site rows.
// Splits sites into Local, Remote, and Kiting Fields sections via category filter.
// Shows "Updating weather ..." in the Local subtitle if the cache load takes over 1 second.
//
import { useState, useEffect } from "react";
import { arraydata } from "./Arraydata";
import Arow from "./Arow";
import { loadWeatherCache } from "./WeatherCache";
import Tfr from "./Tfr";

const Allrows = () => {
    const [siteColors, setSiteColors] = useState(null);
    const [isSlowLoad, setIsSlowLoad] = useState(false);
    const [hasTfrs, setHasTfrs] = useState(false);
    const [nwsError, setNwsError] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsSlowLoad(true), 1000);
        loadWeatherCache()
            .then(({ sites, nwsError }) => {
                clearTimeout(timer);
                setSiteColors(sites);
                setNwsError(nwsError);
            })
            .catch((err) => { clearTimeout(timer); console.error("WeatherCache load failed:", err); });
        return () => clearTimeout(timer);
    }, []);

    return (
        <div>
            {nwsError && (
                <div className="nws-error">
                    {Object.keys(siteColors ?? {}).length > 0
                        ? "NWS unavailable — showing last known forecast"
                        : "Weather data unavailable"}
                </div>
            )}
            <div className="subtitle">
                {!hasTfrs && (siteColors === null && isSlowLoad
                    ? "Updating weather ..."
                    : "Local"
                )}
                <Tfr onActiveTfrs={setHasTfrs} />
            </div>
            <Arow
                arraydata={arraydata.filter((d) => d.category === "local")}
                siteColors={siteColors}
            />
            <div className="subtitle">Remote</div>
            <Arow
                arraydata={arraydata.filter((d) => d.category === "remote")}
                siteColors={siteColors}
            />
            <div className="subtitle">Kiting Fields</div>
            <Arow
                arraydata={arraydata.filter((d) => d.category === "kiting")}
                siteColors={siteColors}
            />
        </div>
    );
};

export default Allrows;
