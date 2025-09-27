const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        date: { type: Date, default: Date.now, required: true },
        description: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0 },
        included: { type: Boolean, default: true },
        type: { type: String, required: true, trim: true },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Recurring expense fields
        isRecurring: { type: Boolean, default: false },
        frequency: {
            type: String,
            enum: ["weekly", "monthly"],
            required: function () {
                return this.isRecurring;
            },
        },
        nextDueDate: { type: Date },
        parentExpenseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Expense",
        }, // Reference to the original recurring expense
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Expense", expenseSchema);
