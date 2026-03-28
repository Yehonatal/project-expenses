const mongoose = require("mongoose");

const expenseFilterPresetSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 60,
        },
        filters: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        isDefault: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    },
);

expenseFilterPresetSchema.index(
    { userId: 1, name: 1 },
    { unique: true, collation: { locale: "en", strength: 2 } },
);

expenseFilterPresetSchema.index(
    { userId: 1, isDefault: 1 },
    {
        unique: true,
        partialFilterExpression: { isDefault: true },
    },
);

module.exports = mongoose.model(
    "ExpenseFilterPreset",
    expenseFilterPresetSchema,
);
