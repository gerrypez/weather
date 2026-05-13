const ptHour = () =>
    new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })).getHours();

// daycolors: null = loading, [] or [[day,color],...] = loaded
const Sitedays = ({ daycolors }) => {
    const hideTodayCol = ptHour() >= 17;

    if (daycolors === null) {
        const count = hideTodayCol ? 6 : 7;
        return (
            <>
                {Array.from({ length: count }).map((_, i) => (
                    <div className="go-gray" key={i} />
                ))}
            </>
        );
    }

    const visibleDays = hideTodayCol ? daycolors.slice(1) : daycolors;

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
