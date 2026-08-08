const mongoose = require("mongoose");

// For your installed passport-local-mongoose version

const passportLocalMongooseModule = require("passport-local-mongoose");
const passportLocalMongoose =
    passportLocalMongooseModule.default || passportLocalMongooseModule;

const Schema = mongoose.Schema;

// User Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
});


userSchema.plugin(passportLocalMongoose);

// User Model

const User = mongoose.model("User", userSchema);

// Export

module.exports = User;