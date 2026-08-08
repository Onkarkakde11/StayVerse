const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");



// CHECK LOGIN

module.exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {

        req.session.redirectUrl = req.originalUrl;

        req.flash(
            "error",
            "You must be logged in first!"
        );

        return res.redirect("/login");
    }

    next();
};



// SAVE REDIRECT URL

module.exports.saveRedirectUrl = (req, res, next) => {

    if (req.session.redirectUrl) {
        res.locals.redirectUrl =
            req.session.redirectUrl;
    }

    next();
};


// VALIDATE LISTING


module.exports.validateListing = (req, res, next) => {

    const { error } =
        listingSchema.validate(req.body);

    if (error) {

        const errMsg = error.details
            .map((el) => el.message)
            .join(",");

        throw new ExpressError(
            400,
            errMsg
        );
    }

    next();
};



// CHECK LISTING OWNER


module.exports.isOwner = async (req, res, next) => {

    const { id } = req.params;

    const listing =
        await Listing.findById(id);

    if (!listing) {

        req.flash(
            "error",
            "Listing does not exist!"
        );

        return res.redirect("/listings");
    }

    if (
        !listing.owner.equals(req.user._id)
    ) {

        req.flash(
            "error",
            "You are not the owner of this listing!"
        );

        return res.redirect(
            `/listings/${id}`
        );
    }

    next();
};



// VALIDATE REVIEW


module.exports.validateReview = (req, res, next) => {

    const { error } =
        reviewSchema.validate(req.body);

    if (error) {

        const errMsg = error.details
            .map((el) => el.message)
            .join(",");

        throw new ExpressError(
            400,
            errMsg
        );
    }

    next();
};



// REVIEW AUTHORIZATION

module.exports.isReviewAuthor =
    async (req, res, next) => {

        const { id, reviewId } = req.params;

        const review =
            await Review.findById(reviewId);

        if (!review) {

            req.flash(
                "error",
                "Review does not exist!"
            );

            return res.redirect(
                `/listings/${id}`
            );
        }

        if (
            !review.author.equals(req.user._id)
        ) {

            req.flash(
                "error",
                "You are not the author of this review!"
            );

            return res.redirect(
                `/listings/${id}`
            );
        }

        next();
    };