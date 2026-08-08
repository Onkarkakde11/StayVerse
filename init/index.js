const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const MONGO_URL =
    "mongodb://127.0.0.1:27017/stayverse";

async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => {
        console.log("Connected to DB");
        initDB();
    })
    .catch((err) => {
        console.log(err);
    });


const initDB = async () => {

    // Find an existing user FIRST
    const user = await User.findOne({});

    if (!user) {
        console.log(
            "❌ No user found. Signup on StayVerse first."
        );

        await mongoose.connection.close();
        return;
    }

    console.log(
        `Using user: ${user.username}`
    );

    // Delete listings only after owner exists
    await Listing.deleteMany({});

    // Add owner to every sample listing
    const listingsWithOwner =
        initData.data.map((obj) => ({
            ...obj,
            owner: user._id
        }));

    // Insert sample listings
    await Listing.insertMany(
        listingsWithOwner
    );

    console.log(
        `✅ ${listingsWithOwner.length} listings initialized`
    );

    console.log(
        `✅ Owner: ${user.username}`
    );

    await mongoose.connection.close();
};