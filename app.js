if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const { MongoStore } = require("connect-mongo");

const ExpressError = require("./utils/ExpressError");

const User = require("./models/user");

const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");
const helpRouter = require("./routes/help");

const app = express();

// IMPORTANT:
// Render provides the PORT automatically.
const PORT = process.env.PORT || 8092;

const dbUrl = process.env.ATLASDB_URL;

// MongoDB connection
mongoose
    .connect(dbUrl)
    .then(() => {
        console.log("✅ Connected to MongoDB Atlas");
    })
    .catch((err) => {
        console.log("MongoDB Error:");
        console.log(err);
    });

// EJS
app.engine("ejs", ejsMate);

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

// Mongo Store
const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,

    crypto: {
        secret: process.env.SECRET,
    },

    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("SESSION STORE ERROR");
    console.log(err);
});

// Session
const sessionOptions = {
    store,

    secret: process.env.SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,

        maxAge: 7 * 24 * 60 * 60 * 1000,

        httpOnly: true,
    },
};

app.use(session(sessionOptions));

app.use(flash());

// Passport
app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

// Global variables
app.use((req, res, next) => {
    res.locals.success = req.flash("success");

    res.locals.error = req.flash("error");

    res.locals.currUser = req.user;

    next();
});

// Home
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Routes
app.use("/", userRouter);

app.use("/listings", listingRouter);

app.use("/listings/:id/reviews", reviewRouter);

// HELP ROUTE
app.use("/help", helpRouter);

// 404 Handler
app.all("/*splat", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Error Handler
app.use((err, req, res, next) => {
    const {
        statusCode = 500,
        message = "Something Went Wrong!",
    } = err;

    if (res.headersSent) {
        return next(err);
    }

    res.status(statusCode).render("error", {
        message,
    });
});

// Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});