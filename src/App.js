import Headerbar from "./Headerbar";
import Allrows from "./Allrows";
import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";

const App = () => {
    // reload app every hour in case NWS has new data 
    useEffect(() => {
        const reloadInterval = 3600000;
        const reloadApp = () => {
            window.location.reload(true);
        };
        const reloadTimeout = setTimeout(reloadApp, reloadInterval);
        // Clear the timeout when the component is unmounted
        return () => clearTimeout(reloadTimeout);
    }, []); // Empty dependency array means this effect runs once on mount

    return (
        <Router>
            <div className="App">
                <Headerbar />
                <Allrows />
            </div>
        </Router>
    );
};

export default App;
