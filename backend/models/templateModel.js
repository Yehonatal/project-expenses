const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
    {
        description: { type: String, required: true, trim: true },
        type: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Template", templateSchema);
