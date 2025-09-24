const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const router = express.Router();

// Google OAuth
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    async (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SEC, {
            expiresIn: "7d",
        });
        res.redirect(
            `${
                process.env.FRONTEND_URL || process.env.CORS_ORIGIN
            }/?token=${token}`
        );
    }
);

// Logout
router.post("/logout", (req, res) => {
    req.logout();
    res.json({ message: "Logged out" });
});

// Get current user
router.get("/me", async (req, res) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SEC);
        const user = await User.findById(decoded.id).select("-__v");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
});

module.exports = router;
