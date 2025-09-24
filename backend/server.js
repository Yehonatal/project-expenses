// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const expenseRoutes = require("./routes/expenseRoutes");
const templateRoutes = require("./routes/templateRoutes");

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

app.use("/api/expenses", expenseRoutes);
app.use("/api/templates", templateRoutes);

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
