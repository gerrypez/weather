import Headerbar from "./Headerbar";
import Allrows from "./Allrows";
import { useEffect } from "react";

const App = () => {
    useEffect(() => {
        const reloadTimeout = setTimeout(() => window.location.reload(), 3600000);
        return () => clearTimeout(reloadTimeout);
    }, []);

    return (
        <div className="App">
            <Headerbar />
            <Allrows />
        </div>
    );
};

export default App;
