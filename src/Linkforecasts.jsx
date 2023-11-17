const link_forecasts = ({ link_forecasts }) => {
    return (
        <div>
            <div className="moretitle">Forecasts:</div>
            <div className="morelinks">
                {link_forecasts.map((link) => (
                    <span key={link.id}>
                        <a className="morelinky" href={link.url} target="_blank" rel="noreferrer">
                            {link.description}
                        </a>
                        |
                    </span>
                ))}
            </div>
        </div>
    );
};

export default link_forecasts;
