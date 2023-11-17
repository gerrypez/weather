import Headerbar from "./Headerbar";
import Allrows from "./Allrows";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
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
