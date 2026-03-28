const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        date: { type: Date, default: Date.now, required: true },
        description: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0 },
        included: { type: Boolean, default: true },
        type: { type: String, required: true, trim: true },
        tags: {
            type: [String],
            default: [],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            default: null,
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Recurring expense fields
        isRecurring: { type: Boolean, default: false },
        frequency: {
            type: String,
            enum: ["daily", "weekly", "monthly", "yearly", "custom"],
            required: function () {
                return this.isRecurring;
            },
        },
        recurrenceRules: {
            daysOfWeek: [Number], // 0-6 (Sunday-Saturday)
            interval: { type: Number, default: 1 }, // every X days/weeks/months
            endDate: { type: Date },
            occurrenceCount: { type: Number }, // Stop after X times
        },
        nextDueDate: { type: Date },
        parentExpenseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Expense",
        }, // Reference to the original recurring expense
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("Expense", expenseSchema);
