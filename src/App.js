import Headerbar from "./Headerbar";
import Allrows from "./Allrows";
import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";

function App() {

    // App reloads every 3 hours for new NWS data
    useEffect(() => {
        const intervalId = setInterval(() => {
          window.location.reload();
        }, 10800000); // 3 hours in milliseconds
        return () => clearInterval(intervalId);
      }, []);

    return (
        <Router>
            <div className="App">
                <Headerbar />
                <Allrows />
            </div>
        </Router>
    );
}

export default App;
