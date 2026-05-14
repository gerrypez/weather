// Sitedays: renders the row of 7 colored day boxes for one site.
// Shows gray placeholders while data is loading; hides today's column after 5PM PT.
//
const ptHour = () =>
    new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })).getHours();

// daycolors: null = loading, [] or [[day,color],...] = loaded
const Sitedays = ({ daycolors }) => {
    const hideTodayCol = ptHour() >= 17;

    if (daycolors === null) {
        const count = 7;
        return (
            <>
                {Array.from({ length: count }).map((_, i) => (
                    <div className="go-gray" key={i} />
                ))}
            </>
        );
    }

    // slice(1,7): NWS covers ~156h (~6.5 days), so slot 7 is always a partial day —
    // cap at slot 6 when hiding today to avoid showing an unreliable 7th column.
    const visibleDays = (hideTodayCol ? daycolors.slice(1, 7) : daycolors.slice(0, 7))
        .filter(d => d[0] !== "");

    return (
        <>
            {visibleDays.map((daycolor, i) => (
                <div className={daycolor[1]} key={i}>
                    {daycolor[0]}
                </div>
            ))}
        </>
    );
};

export default Sitedays;
