const mongoose = require("mongoose");

const workspaceMemberSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["owner", "member"],
            default: "member",
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false },
);

const workspaceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80,
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        inviteCode: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            unique: true,
            index: true,
        },
        members: {
            type: [workspaceMemberSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    },
);

workspaceSchema.index({ "members.userId": 1 });

module.exports = mongoose.model("Workspace", workspaceSchema);
