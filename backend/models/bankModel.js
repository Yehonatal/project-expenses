const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        externalId: {
            type: Number,
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        shortName: {
            type: String,
            default: null,
            trim: true,
        },
        colors: {
            type: [String],
            default: [],
        },
        lastImportBatchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ImportBatch",
            default: null,
        },
    },
    { timestamps: true }
);

bankSchema.index({ userId: 1, externalId: 1 }, { unique: true });

module.exports = mongoose.model("Bank", bankSchema);
