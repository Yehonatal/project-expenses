const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        date: { type: Date, default: Date.now, required: true },
        description: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0 },
        included: { type: Boolean, default: true },
        type: { type: String, required: true, trim: true },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Expense", expenseSchema);
