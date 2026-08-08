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

// ==========================================
// APP
// ==========================================

const app = express();

// Render provides PORT automatically
const PORT = process.env.PORT || 8092;

// ==========================================
// DATABASE
// ==========================================

const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to MongoDB Atlas");
}

main()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB Error:");
        console.log(err);
    });

// ==========================================
// VIEW ENGINE
// ==========================================

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ==========================================
// MONGO STORE
// ==========================================

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("SESSION STORE ERROR");
    console.log(err);
});

// ==========================================
// SESSION
// ==========================================

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

// ==========================================
// PASSPORT
// ==========================================

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ==========================================
// GLOBAL VARIABLES
// ==========================================

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// ==========================================
// ROUTES
// ==========================================

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

// ==========================================
// 404
// ==========================================

app.all("/*splat", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
    const {
        statusCode = 500,
        message = "Something Went Wrong!",
    } = err;

    res.status(statusCode).render("error", {
        message,
    });
});