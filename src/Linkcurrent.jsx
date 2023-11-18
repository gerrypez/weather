/*
*  Links for current weather below each site row
*/
const link_current = ({ link_current }) => {
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

export default link_current;
