import { arraydata } from "./Arraydata";
import Arow from "./Arow";

const Allrows = () => {
    // console.log("<Allrows />");

    return (
    <div>
        <div className="subtitle">Local Sites</div>
        <Arow arraydata={arraydata.filter((data) => data.category === "local")} />
        <div className="subtitle">Remote Sites</div>
        <Arow arraydata={arraydata.filter((data) => data.category === "remote")} />
        <div className="subtitle">Kiting</div>
        <Arow arraydata={arraydata.filter((data) => data.category === "kiting")} />
    </div>
    );
}

export default Allrows;
