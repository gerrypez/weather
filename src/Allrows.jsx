import { arraydata } from "./Arraydata";
import Arow from "./Arow";
import Bottomerrors from "./Bottomerrors";
// import Stationcheck from "./Stationcheck";

const Allrows = () => {

    return (
    <div>
        <div className="subtitle">Local Sites</div>
        <Arow arraydata={arraydata.filter((data) => data.category === "local")} />
        <div className="subtitle">Remote Sites</div>
        <Arow arraydata={arraydata.filter((data) => data.category === "remote")} />
        <div className="subtitle">Kiting Fields</div>
        <Arow arraydata={arraydata.filter((data) => data.category === "kiting")} />
        <Bottomerrors />
        { /* <Stationcheck arraydata={arraydata} /> */ }
    </div>
    );
}

export default Allrows;
