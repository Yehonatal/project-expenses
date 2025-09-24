const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
    {
        description: { type: String, required: true, trim: true },
        type: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Template", templateSchema);
