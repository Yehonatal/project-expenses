const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        startMonth: { type: Number, required: true, min: 1, max: 12 },
        startYear: { type: Number, required: true },
        endMonth: { type: Number, required: true, min: 1, max: 12 },
        endYear: { type: Number, required: true },
        totalBudget: { type: Number, required: true, min: 0 },
        spent: { type: Number, default: 0 }, // Calculated across the range
    },
    {
        timestamps: true,
    }
);

// Ensure no overlapping budgets for the same user
budgetSchema.index(
    { userId: 1, startMonth: 1, startYear: 1, endMonth: 1, endYear: 1 },
    { unique: true }
);

module.exports = mongoose.model("Budget", budgetSchema);
