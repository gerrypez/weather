// Linkcurrent: renders the "Current" section of links in an expanded site row.
// Links point to live weather station data for the site.
//
const Linkcurrent = ({ link_current }) => {
    return (
        <div>
            <div className="moretitle">Current</div>
            <div className="morelinks">
                {link_current.map((link) => (
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

export default Linkcurrent;
