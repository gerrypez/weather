// Sitename: renders the site name label on the left side of a site row.
//
const Sitename = ({ sitename, id }) => {
    return <div className="sitename" id={id}>{sitename}</div>;
};

export default Sitename;
