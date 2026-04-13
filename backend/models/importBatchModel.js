const mongoose = require("mongoose");

const importBatchSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        sourceFileName: {
            type: String,
            default: null,
            trim: true,
        },
        schemaVersion: {
            type: String,
            default: null,
        },
        version: {
            type: String,
            default: null,
        },
        exportDate: {
            type: Date,
            default: null,
        },
        counts: {
            accounts: { type: Number, default: 0 },
            banks: { type: Number, default: 0 },
            categories: { type: Number, default: 0 },
            transactions: { type: Number, default: 0 },
        },
        stats: {
            debitTotal: { type: Number, default: 0 },
            creditTotal: { type: Number, default: 0 },
            debitCount: { type: Number, default: 0 },
            creditCount: { type: Number, default: 0 },
        },
        meta: {
            failedParsesCount: { type: Number, default: 0 },
            receiverCategoryMappingsCount: { type: Number, default: 0 },
            smsPatternsCount: { type: Number, default: 0 },
        },
        accounts: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        banks: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        categories: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        budgets: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        syncStatus: {
            accounts: { type: Boolean, default: false },
            banks: { type: Boolean, default: false },
            categories: { type: Boolean, default: false },
            budgets: { type: Boolean, default: false },
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("ImportBatch", importBatchSchema);
