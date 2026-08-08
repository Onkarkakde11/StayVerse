const User = require("../models/user.js");

// Signup Form
// GET /signup

module.exports.renderSignupForm = (req, res) => {

    res.render("users/signup.ejs");

};


// Signup
// POST /signup

module.exports.signup = async (req, res, next) => {

    try {

        const {
            username,
            email,
            password
        } = req.body;

        const newUser = new User({
            username,
            email
        });

        // Register User

        const registeredUser =
            await User.register(
                newUser,
                password
            );

        // Login After Signup

        req.login(
            registeredUser,
            (err) => {

                if (err) {
                    return next(err);
                }

                req.flash(
                    "success",
                    "Welcome to StayVerse!"
                );

                res.redirect("/listings");

            }
        );

    } catch (err) {

        req.flash(
            "error",
            err.message
        );

        res.redirect("/signup");
    }
};


// Login Form
// GET /login

module.exports.renderLoginForm = (req, res) => {

    res.render("users/login.ejs");

};


// Login
// POST /login

module.exports.login = (req, res) => {

    req.flash(
        "success",
        `Welcome back ${req.user.username}!`
    );

    // Redirect User

    const redirectUrl =
        res.locals.redirectUrl ||
        "/listings";

    res.redirect(redirectUrl);
};


// Logout
// GET /logout

module.exports.logout = (req, res, next) => {

    req.logout((err) => {

        if (err) {
            return next(err);
        }

        req.flash(
            "success",
            "You have been logged out."
        );

        res.redirect("/listings");

    });
};