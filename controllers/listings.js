const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index =async(req, res) => {
    const allListings =await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            },
        })
        .populate("owner");
    if(!listing){
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

// module.exports.createListing = async(req, res, next) => {
//     let response = await geocodingClient.forwardGeocode({
//         query: req.body.listing.location,
//         limit: 1,
//       })
//         .send();

//     let url = req.file.path;
//     let  filename = req.file.filename;

//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;
//     newListing.image = {url, filename};

//     newListing.geometry = response.body.features[0].geometry.coordinates;
//       console.log(`geometry: ${newListing.geometry}`);
//     let savedListing = await newListing.save();
//     req.flash("success", "New Listing Created!");
//     res.redirect("/listings");
// };

module.exports.createListing = async (req, res, next) => {
    try {
        const response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        }).send();

        if (!response.body.features || response.body.features.length === 0) {
            throw new Error("Invalid location");
        }

        const url = req.file.path;
        const filename = req.file.filename;

        const newListingData = {
            ...req.body.listing,
            owner: req.user._id,
            image: { url, filename },
            geometry: {
                type: "Point",
                coordinates: response.body.features[0].geometry.coordinates,
            },
        };

        const newListing = new Listing(newListingData);
        const savedListing = await newListing.save();

        req.flash("success", "New Listing Created!");
        res.redirect("/listings"+ encodeURIComponent(JSON.stringify(savedListing)));
    } catch (error) {
        
        console.error("Error creating listing:", error);
        req.flash("error", "Failed to create listing.");
        res.redirect("/listings");
    }
};
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }

    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    
    if(typeof req.file!=="undefined" ){
        let url = req.file.path;
        let  filename = req.file.filename; 
        listing.image = {url, filename};
        await listing.save();
    }; 
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};