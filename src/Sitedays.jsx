// daycolors: null = loading, [] or [[day,color],...] = loaded
const Sitedays = ({ daycolors }) => {
    if (daycolors === null) {
        return (
            <>
                {Array.from({ length: 7 }).map((_, i) => (
                    <div className="go-gray" key={i} />
                ))}
            </>
        );
    }

    return (
        <>
            {daycolors.map((daycolor, i) => (
                <div className={daycolor[1]} key={i}>
                    {daycolor[0]}
                </div>
            ))}
        </>
    );
};

export default Sitedays;
