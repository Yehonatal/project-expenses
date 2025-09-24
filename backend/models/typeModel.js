const mongoose = require("mongoose");

const typeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// Compound unique index on name and userId
typeSchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Type", typeSchema);
