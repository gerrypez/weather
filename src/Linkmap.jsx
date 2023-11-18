const Linkmap = ({ id, nws_image }) => {
    // console.log("<Linkmap /> " + nws_image);

    const mapid = "map" + id;

    // console.log("nws_image =" + nws_image);

    return (
        <div>
            <div className="nws_image_box">
                <img className="nws_image" id={mapid} alt="#" src={nws_image} width="450" />
            </div>
        </div>
    );
};

export default Linkmap;
