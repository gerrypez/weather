// Sitedays: renders the row of 7 colored day boxes for one site.
// Shows gray placeholders while data is loading; hides today's column after 5PM PT.
// Day labels and starting slot are computed from today's actual date so the display
// stays correct even when the cached data was built on a previous day.
//
const weekday = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const weekdayIndex = { Su: 0, Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6 };

// daycolors: null = loading, [] or [[day,color],...] = loaded
const Sitedays = ({ daycolors }) => {
    const ptNow = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    const ptHour = ptNow.getHours();
    const hideTodayCol = ptHour >= 17;
    const todayNum = ptNow.getDay();

    if (daycolors === null) {
        return (
            <>
                {Array.from({ length: 7 }).map((_, i) => (
                    <div className="go-gray" key={i} />
                ))}
            </>
        );
    }

    // If the cache was built on a prior day, slot 0's stored label will be behind today.
    // Compute daysElapsed so we skip past stale leading slots (e.g. skip "Su" on Monday).
    const slot0Label = daycolors[0]?.[0];
    const slot0DayNum = slot0Label ? (weekdayIndex[slot0Label] ?? todayNum) : todayNum;
    const daysElapsed = (todayNum - slot0DayNum + 7) % 7;
    const startSlot = daysElapsed + (hideTodayCol ? 1 : 0);
    const maxCols = hideTodayCol ? 6 : 7;

    // slice(startSlot, startSlot+maxCols): cap at slot 6 when hiding today to avoid
    // showing an unreliable partial 7th column.
    const visibleDays = daycolors
        .slice(startSlot, startSlot + maxCols)
        .filter(d => d[0] !== "");

    const paddedDays = [
        ...visibleDays,
        ...Array.from({ length: Math.max(0, maxCols - visibleDays.length) }, () => null),
    ];

    const startDayNum = (todayNum + (hideTodayCol ? 1 : 0)) % 7;

    return (
        <>
            {paddedDays.map((daycolor, i) =>
                daycolor === null
                    ? <div className="go-empty" key={i} />
                    : <div className={daycolor[1]} key={i}>
                        {weekday[(startDayNum + i) % 7]}
                    </div>
            )}
        </>
    );
};

export default Sitedays;
