const mongoose = require("mongoose");

const bankAccountSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        accountNumber: {
            type: String,
            required: true,
            trim: true,
        },
        bankId: {
            type: Number,
            default: null,
            index: true,
        },
        bankName: {
            type: String,
            default: null,
            trim: true,
        },
        bankShortName: {
            type: String,
            default: null,
            trim: true,
        },
        accountHolderName: {
            type: String,
            default: null,
            trim: true,
        },
        balance: {
            type: Number,
            default: null,
        },
        settledBalance: {
            type: Number,
            default: null,
        },
        pendingCredit: {
            type: Number,
            default: null,
        },
        profileId: {
            type: Number,
            default: null,
        },
        source: {
            type: String,
            enum: ["manual", "import"],
            default: "manual",
        },
        lastImportBatchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ImportBatch",
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

bankAccountSchema.index({ userId: 1, accountNumber: 1 }, { unique: true });

module.exports = mongoose.model("BankAccount", bankAccountSchema);
