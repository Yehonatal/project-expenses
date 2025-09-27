// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
const session = require("express-session");
const expenseRoutes = require("./routes/expenseRoutes");
const templateRoutes = require("./routes/templateRoutes");
const typesRoutes = require("./routes/typesRoutes");
const authRoutes = require("./routes/authRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const typesController = require("./controllers/typesController");
const User = require("./models/userModel");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
}

app.use(express.json());

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

// Session for Passport
app.use(
    session({
        secret: process.env.JWT_SEC,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

// Passport Google Strategy
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_OAUTH2_CLIENT_ID,
            clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
            callbackURL: `${
                process.env.BACKEND_URL || "http://localhost:5000"
            }/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });
                if (!user) {
                    user = new User({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        picture: profile.photos[0].value,
                    });
                    await user.save();
                }
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

app.use("/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/types", typesRoutes);
app.use("/api/budgets", budgetRoutes);

// fallback in case routes wiring fails elsewhere — provide direct endpoint
app.get("/api/types", async (req, res, next) => {
    try {
        await typesController.getTypes(req, res);
    } catch (err) {
        next(err);
    }
});

app.get("/", (req, res) => {
    res.json({ status: "ok", message: "Expense tracker API" });
});

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB Atlas");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    });
