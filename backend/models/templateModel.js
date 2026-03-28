const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
    {
        description: { type: String, required: true, trim: true },
        type: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        category: {
            type: String,
            enum: ["expense", "income"],
            default: "expense",
        },
        frequency: {
            type: String,
            enum: ["weekly", "monthly", "yearly"],
            default: "monthly",
        },
        dayOfMonth: { type: Number, min: 1, max: 31 },
        startDate: { type: Date },
        endDate: { type: Date },
        provider: { type: String, trim: true, default: "any" },
        status: {
            type: String,
            enum: ["active", "paused"],
            default: "active",
        },
        isRecurring: { type: Boolean, default: true },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("Template", templateSchema);
