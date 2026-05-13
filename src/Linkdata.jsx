// Linkdata: renders the "Data" section of links in an expanded site row.
// Links point to APIs, maps, and site guides for the site.
//
const Linkdata = ({ link_data }) => {
    return (
        <div>
            <div className="moretitle">Data</div>
            <div className="morelinks">
                {link_data.map((link) => (
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

export default Linkdata;
