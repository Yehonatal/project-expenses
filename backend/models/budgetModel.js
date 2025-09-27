const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["weekly", "monthly", "multi-month", "yearly"],
            required: true,
        },
        // For weekly budgets
        startDate: { type: Date },
        endDate: { type: Date },
        // For monthly/multi-month budgets
        startMonth: { type: Number, min: 1, max: 12 },
        startYear: { type: Number },
        endMonth: { type: Number, min: 1, max: 12 },
        endYear: { type: Number },
        // For yearly budgets
        year: { type: Number },
        totalBudget: { type: Number, required: true, min: 0 },
        spent: { type: Number, default: 0 }, // Calculated across the range
    },
    {
        timestamps: true,
    }
);

// Ensure no overlapping budgets for the same user and type
budgetSchema.index(
    {
        userId: 1,
        type: 1,
        startDate: 1,
        endDate: 1,
        startMonth: 1,
        startYear: 1,
        endMonth: 1,
        endYear: 1,
        year: 1,
    },
    { unique: true, sparse: true }
);

module.exports = mongoose.model("Budget", budgetSchema);
