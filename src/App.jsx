// App: root component that renders the header and all site rows.
// Schedules an auto-reload at 4AM, 4PM, and 5PM PT to pick up new NWS data and hide today's column.
//
import Headerbar from "./Headerbar";
import Allrows from "./Allrows";
import { useEffect } from "react";

// Returns ms until the next significant PT event: 4AM, 4PM, or 5PM.
// Fires 1 min after each threshold so cache/display logic triggers cleanly.
function msUntilNextEvent() {
    const now = new Date();
    const ptNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    for (const hour of [4, 16, 17]) {
        const event = new Date(ptNow);
        event.setHours(hour, 1, 0, 0);
        if (event > ptNow) return event - ptNow;
    }
    // All events passed today — reload at 4:01AM tomorrow PT
    const event = new Date(ptNow);
    event.setDate(event.getDate() + 1);
    event.setHours(4, 1, 0, 0);
    return event - ptNow;
}

const App = () => {
    useEffect(() => {
        const reloadTimeout = setTimeout(() => window.location.reload(), msUntilNextEvent());
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
