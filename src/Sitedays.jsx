// daycolors: null = loading, [] or [[day,color],...] = loaded
const Sitedays = ({ daycolors }) => {
    // Show 7 placeholder boxes while data is loading
    if (daycolors === null) {
        return (
            <div>
                {Array.from({ length: 7 }).map((_, i) => (
                    <div className="go-gray" key={i} />
                ))}
            </div>
        );
    }

    return (
        <div>
            {daycolors.map((daycolor, i) => (
                <div className={daycolor[1]} key={i}>
                    {daycolor[0]}
                </div>
            ))}
        </div>
    );
};

export default Sitedays;
