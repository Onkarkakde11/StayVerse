const Listing = require("../models/listing");

// Index
// GET /listings
// Show all listings + category filter + search

module.exports.index = async (req, res) => {

    const { category, search } = req.query;

    const filter = {};

    // Category Filter

    if (category && category.trim() !== "") {
        filter.category = category.trim();
    }

    // Search

    if (search && search.trim() !== "") {

        const regex = new RegExp(search.trim(), "i");

        filter.$or = [
            { title: regex },
            { location: regex },
            { country: regex },
            { category: regex }
        ];
    }

    // Get Listings

    const allListings = await Listing.find(filter);

    // Render

    res.render("listings/index.ejs", {

        allListings,

        selectedCategory: category || "",

        searchQuery: search || ""

    });
};


// Render New Listing Form
// GET /listings/new

module.exports.renderNewForm = (req, res) => {

    res.render("listings/new.ejs");

};


// Show Single Listing
// GET /listings/:id

module.exports.showListing = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing
        .findById(id)

        // Reviews
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })

        // Listing Owner
        .populate("owner");

    // Listing Does Not Exist

    if (!listing) {

        req.flash(
            "error",
            "The listing you requested does not exist!"
        );

        return res.redirect("/listings");
    }

    res.render(
        "listings/show.ejs",
        { listing }
    );

};


// Create Listing
// POST /listings
// Cloudinary Image Upload

module.exports.createListing = async (req, res) => {

    // Create Listing

    const newListing =
        new Listing(req.body.listing);

    // Owner

    newListing.owner =
        req.user._id;

    // Cloudinary Image

    if (req.file) {

        newListing.image = {

            url: req.file.path,

            filename: req.file.filename

        };
    }

    // Save

    await newListing.save();

    req.flash(
        "success",
        "New listing created successfully!"
    );

    res.redirect(
        `/listings/${newListing._id}`
    );

};


// Render Edit Form
// GET /listings/:id/edit

module.exports.renderEditForm = async (req, res) => {

    const { id } = req.params;

    const listing =
        await Listing.findById(id);

    if (!listing) {

        req.flash(
            "error",
            "The listing you requested does not exist!"
        );

        return res.redirect("/listings");
    }

    // Cloudinary Preview

    let originalImageUrl = "";

    if (
        listing.image &&
        listing.image.url
    ) {

        originalImageUrl =
            listing.image.url.replace(
                "/upload",
                "/upload/w_500,h_350,c_fill"
            );

    }

    res.render(
        "listings/edit.ejs",
        {
            listing,
            originalImageUrl
        }
    );

};


// Update Listing
// PUT /listings/:id
// Supports Cloudinary Image Upload

module.exports.updateListing = async (req, res) => {

    const { id } = req.params;

    // Update Text Data

    const listing =
        await Listing.findByIdAndUpdate(

            id,

            {
                ...req.body.listing
            },

            {
                new: true,
                runValidators: true
            }

        );

    if (!listing) {

        req.flash(
            "error",
            "Listing not found!"
        );

        return res.redirect("/listings");
    }

    // Update Image

    if (req.file) {

        listing.image = {

            url: req.file.path,

            filename: req.file.filename

        };

        await listing.save();

    }

    req.flash(
        "success",
        "Listing updated successfully!"
    );

    res.redirect(
        `/listings/${id}`
    );

};


// Delete Listing
// DELETE /listings/:id

module.exports.destroyListing = async (req, res) => {

    const { id } = req.params;

    const deletedListing =
        await Listing.findByIdAndDelete(id);

    if (!deletedListing) {

        req.flash(
            "error",
            "Listing not found!"
        );

        return res.redirect("/listings");
    }

    req.flash(
        "success",
        "Listing deleted successfully!"
    );

    res.redirect("/listings");

};