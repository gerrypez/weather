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
                <span className="status"></span>
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
                        <li>code v2.0 github.com/gerrypez/weather</li>
                        <li>developer: gerrypez@gmail.com</li>
                    </ul>
                </div>
            )}
            <div className="headererrormessage" id="showtopmessage">
                NWS API, no data some sites
            </div>
        </div>
    );
};

export default Headerbar;
