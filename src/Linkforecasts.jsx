// Linkforecasts: renders the "Forecast" section of links in an expanded site row.
// Links point to NWS and third-party forecast pages for the site.
//
const Linkforecasts = ({ link_forecasts }) => {
    return (
        <div>
            <div className="moretitle">Forecast</div>
            <div className="morelinks">
                {link_forecasts.map((link) => (
                    <span key={link.id}>
                        <a className="morelinky" href={link.url} target="_blank" rel="noreferrer">
                            {link.description}
                        </a>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default Linkforecasts;
