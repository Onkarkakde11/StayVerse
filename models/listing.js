const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    image: {
        url: {
            type: String,
            default:
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
        },

        filename: {
            type: String,
            default: ""
        }
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    location: {
        type: String,
        required: true,
        trim: true
    },

    country: {
        type: String,
        required: true,
        trim: true
    },

    category: {
        type: String,

        enum: [
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
            "Trending"
        ],

        default: "Rooms"
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

const Review = require("./review.js");

// Delete Reviews When Listing Is Deleted

listingSchema.post(
    "findOneAndDelete",

    async function (listing) {

        if (listing) {

            await Review.deleteMany({
                _id: {
                    $in: listing.reviews
                }
            });

        }

    }
);

const Listing = mongoose.model(
    "Listing",
    listingSchema
);

module.exports = Listing;