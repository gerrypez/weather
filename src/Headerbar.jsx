// Headerbar: top banner with the app title and an info button.
// Toggling the info button reveals a legend explaining the color coding and contact details.
//
import { useState } from "react";

const Headerbar = () => {
    // when info button is clicked, show info panel
    const [isShown, setIsShown] = useState(false);
    const showInfo = (e) => {
        setIsShown((current) => !current);
    };

    return (
        <div>
            <div className="thetitle">
                <span className="baptitle">Lift Paragliding: SF Bay Area Forecast</span>
                <button className="infobutton" onClick={showInfo}>
                    info
                </button>
            </div>

            {isShown && (
                <div className="infopanel">
                    <ul>
                        <li className="infoblocks">
                            <span className="infogreen">good</span>
                            <span className="infogreenlight">likely</span>
                            <span className="infoyellow">maybe</span>
                            <span className="infogray">unlikely</span>
                            <span className="infoblue">rain</span>
                        </li>
                        <li>click row for weather details</li>
                        <li>
                            code v3.0{" "}
                            <a href="https://github.com/gerrypez/weather" target="_blank" rel="noreferrer">
                                github.com/gerrypez/weather
                            </a>
                        </li>
                        <li>
                            website url{" "}
                            <a href="https://liftweather-c9ac8.web.app/" target="_blank" rel="noreferrer">
                                https://liftweather-c9ac8.web.app/
                            </a>
                        </li>
                        <li>
                            developer:{" "}
                            <a href="mailto:gerrypez@gmail.com">
                                gerrypez@gmail.com
                            </a>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Headerbar;
