/*
*  Links for data below each site row
*/
const link_data = ({ link_data }) => {
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

export default link_data;
