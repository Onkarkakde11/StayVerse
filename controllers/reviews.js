const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

// Create Review
// POST /listings/:id/reviews

module.exports.createReview = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {

        req.flash(
            "error",
            "Listing does not exist!"
        );

        return res.redirect("/listings");
    }

    // Create Review

    const newReview = new Review(
        req.body.review
    );

    // Set Review Author

    newReview.author = req.user._id;

    // Save Review

    await newReview.save();

    // Add Review to Listing

    listing.reviews.push(newReview);

    // Save Listing

    await listing.save();

    req.flash(
        "success",
        "Review added successfully!"
    );

    res.redirect(`/listings/${id}`);
};


// Delete Review
// DELETE /listings/:id/reviews/:reviewId

module.exports.destroyReview = async (req, res) => {

    const { id, reviewId } = req.params;

    // Remove Review from Listing

    await Listing.findByIdAndUpdate(
        id,
        {
            $pull: {
                reviews: reviewId
            }
        }
    );

    // Delete Review

    await Review.findByIdAndDelete(
        reviewId
    );

    req.flash(
        "success",
        "Review deleted successfully!"
    );

    res.redirect(`/listings/${id}`);
};