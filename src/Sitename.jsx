// import { useState } from "react";

const Sitename = ({ id, name }) => {
    // console.log("<Sitename /> ..." + id + name);
    // this works

    // const mapid = "map" + id;

    // const [mapShown, setMapShown] = useState(true);
    // const displayMap = (mapid) => {
    //     // setMapShown((current) => !current);
    //     console.log("sitename click ..." + mapid);
    // };

    return (
        <div className="sitename">
            {/* <button className="rowbutton" onClick={displayMap(mapid)}>
                +
            </button> */}
            {name}
        </div>
    );
};

export default Sitename;
