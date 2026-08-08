const Joi = require("joi");


// LISTING SCHEMA

module.exports.listingSchema = Joi.object({

    listing: Joi.object({

        title: Joi.string()
            .required(),

        description: Joi.string()
            .required(),

        price: Joi.number()
            .min(0)
            .required(),

        location: Joi.string()
            .required(),

        country: Joi.string()
            .required(),

        category: Joi.string()
            .valid(
                "Rooms",
                "Villas",
                "Amazing Views",
                "Iconic Cities",
                "Surfing",
                "Amazing Pools",
                "Beach",
                "Cabins",
                "Mountains",
                "Farms",
                "Lakefront",
                "Trending",
                "Castles",
                "Camping",
                "Arctic",
                "Domes",
                "Boats"
            )
            .required()

    }).required()

});

// REVIEW SCHEMA
module.exports.reviewSchema = Joi.object({

    review: Joi.object({

        rating: Joi.number()
            .required()
            .min(1)
            .max(5),

        comment: Joi.string()
            .required()

    }).required()

});