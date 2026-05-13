// Nwsimage: renders the NWS meteogram image shown in an expanded site row.
//
const Nwsimage = ({ nws_image }) => {
    return (
        <div>
            <div className="nws_image_box">
                <img className="nws_image" alt="#" src={nws_image} />
            </div>
        </div>
    );
};

export default Nwsimage;
