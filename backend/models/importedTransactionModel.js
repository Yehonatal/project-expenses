const mongoose = require("mongoose");

const importedTransactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        importBatchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ImportBatch",
            required: true,
            index: true,
        },
        amount: { type: Number, required: true, min: 0 },
        reference: { type: String, default: null, trim: true },
        creditor: { type: String, default: null, trim: true },
        receiver: { type: String, default: null, trim: true },
        note: { type: String, default: null, trim: true },
        time: { type: Date, default: null, index: true },
        status: { type: String, default: null, trim: true },
        currentBalance: { type: Number, default: null },
        bankId: { type: Number, default: null, index: true },
        bankName: { type: String, default: null, trim: true },
        bankShortName: { type: String, default: null, trim: true },
        transactionType: {
            type: String,
            enum: ["DEBIT", "CREDIT", "OTHER"],
            default: "OTHER",
            index: true,
        },
        accountNumber: { type: String, default: null, trim: true },
        categoryId: { type: Number, default: null },
        profileId: { type: Number, default: null },
        serviceCharge: { type: Number, default: 0 },
        vat: { type: Number, default: 0 },
        raw: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

importedTransactionSchema.index({ userId: 1, importBatchId: 1, time: -1 });

module.exports = mongoose.model(
    "ImportedTransaction",
    importedTransactionSchema,
);
