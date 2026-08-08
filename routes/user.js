const express = require("express");
const router = express.Router();

const passport = require("passport");

const wrapAsync = require("../utils/wrapAsync.js");

const userController = require("../controllers/users.js");

const {
    saveRedirectUrl
} = require("../middleware.js");

// Signup
// GET /signup
// POST /signup

router
    .route("/signup")

    .get(
        userController.renderSignupForm
    )

    .post(
        wrapAsync(userController.signup)
    );


// Login
// GET /login
// POST /login

router
    .route("/login")

    .get(
        userController.renderLoginForm
    )

    .post(
        saveRedirectUrl,

        passport.authenticate(
            "local",
            {
                failureRedirect: "/login",
                failureFlash: true
            }
        ),

        userController.login
    );


// Logout

router.get(
    "/logout",
    userController.logout
);

module.exports = router;