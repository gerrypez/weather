// App: root component that renders the header and all site rows.
// Schedules an auto-reload at 4AM, 4PM, and 5PM PT to pick up new NWS data and hide today's column.
//
import Headerbar from "./Headerbar";
import Allrows from "./Allrows";
import { useEffect } from "react";

// Returns ms until the next significant PT event: midnight, 2AM, 8AM, 2PM, or 5PM.
// Midnight ensures the day column labels update when the date rolls over.
// Fires 1 min after each threshold so cache/display logic triggers cleanly.
function msUntilNextEvent() {
    const now = new Date();
    const ptNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    for (const hour of [0, 2, 8, 14, 17]) {
        const event = new Date(ptNow);
        event.setHours(hour, 1, 0, 0);
        if (event > ptNow) return event - ptNow;
    }
    // All events passed today — reload at 12:01AM tomorrow PT
    const event = new Date(ptNow);
    event.setDate(event.getDate() + 1);
    event.setHours(0, 1, 0, 0);
    return event - ptNow;
}

const App = () => {
    useEffect(() => {
        const nextEvent = Date.now() + msUntilNextEvent();

        // visibilitychange catches the case where the tab was backgrounded (common on mobile)
        // and the setTimeout fired late or not at all — reload if we woke up past the threshold.
        const handleVisibility = () => {
            if (document.visibilityState === "visible" && Date.now() >= nextEvent) {
                window.location.reload();
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);

        const reloadTimeout = setTimeout(() => window.location.reload(), msUntilNextEvent());
        return () => {
            clearTimeout(reloadTimeout);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, []);

    return (
        <div className="App">
            <Headerbar />
            <Allrows />
        </div>
    );
};

export default App;
