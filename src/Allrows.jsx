import { useState, useEffect } from "react";
import { arraydata } from "./Arraydata";
import Arow from "./Arow";
import { loadWeatherCache } from "./WeatherCache";

const Allrows = () => {
    const [siteColors, setSiteColors] = useState(null);

    useEffect(() => {
        loadWeatherCache()
            .then(setSiteColors)
            .catch((err) => console.error("WeatherCache load failed:", err));
    }, []);

    return (
        <div>
            <div className="subtitle">Local</div>
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
