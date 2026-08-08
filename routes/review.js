const express = require("express");

const router = express.Router({
    mergeParams: true
});

const wrapAsync =
    require("../utils/wrapAsync.js");

const ExpressError =
    require("../utils/ExpressError.js");

const Listing =
    require("../models/listing.js");

const Review =
    require("../models/review.js");

const {
    reviewSchema
} = require("../schema.js");

// Validate Review

const validateReview = (req, res, next) => {

    const { error } =
        reviewSchema.validate(req.body);

    if (error) {

        const errMsg =
            error.details
                .map((el) => el.message)
                .join(",");

        throw new ExpressError(
            400,
            errMsg
        );
    }

    next();
};


// Create Review
// POST /listings/:id/reviews

router.post(
    "/",

    validateReview,

    wrapAsync(async (req, res) => {

        const { id } = req.params;

        const listing =
            await Listing.findById(id);

        if (!listing) {

            req.flash(
                "error",
                "Listing you requested for does not exist!"
            );

            return res.redirect(
                "/listings"
            );
        }

        const newReview =
            new Review(req.body.review);

        await newReview.save();

        listing.reviews.push(
            newReview
        );

        await listing.save();

        // Success Flash

        req.flash(
            "success",
            "New Review Created!"
        );

        res.redirect(
            `/listings/${id}`
        );

    })
);


// Delete Review
// DELETE /listings/:id/reviews/:reviewId

router.delete(
    "/:reviewId",

    wrapAsync(async (req, res) => {

        const {
            id,
            reviewId
        } = req.params;

        await Listing.findByIdAndUpdate(
            id,
            {
                $pull: {
                    reviews: reviewId
                }
            }
        );

        const deletedReview =
            await Review.findByIdAndDelete(
                reviewId
            );

        if (!deletedReview) {

            req.flash(
                "error",
                "Review does not exist!"
            );

            return res.redirect(
                `/listings/${id}`
            );
        }

        // Success Flash

        req.flash(
            "success",
            "Review Deleted!"
        );

        res.redirect(
            `/listings/${id}`
        );

    })
);


// Export Router

module.exports = router;