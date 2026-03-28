const mongoose = require("mongoose");
const Workspace = require("../models/workspaceModel");

const generateInviteCode = () =>
    Math.random().toString(36).slice(2, 8).toUpperCase();

const createUniqueInviteCode = async () => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
        const candidate = generateInviteCode();
        const existing = await Workspace.findOne({ inviteCode: candidate })
            .select("_id")
            .lean();
        if (!existing) return candidate;
    }
    return `${Date.now().toString(36).slice(-6)}`.toUpperCase();
};

exports.createWorkspace = async (req, res) => {
    try {
        const name = String(req.body?.name || "").trim();
        if (!name) {
            return res
                .status(400)
                .json({ message: "Workspace name is required" });
        }

        const workspace = await Workspace.create({
            name,
            ownerId: req.user._id,
            inviteCode: await createUniqueInviteCode(),
            members: [
                {
                    userId: req.user._id,
                    role: "owner",
                },
            ],
        });

        const populated = await Workspace.findById(workspace._id)
            .populate("ownerId", "name email picture")
            .populate("members.userId", "name email picture")
            .lean();

        return res.status(201).json(populated);
    } catch (err) {
        console.error("createWorkspace error:", err);
        return res
            .status(500)
            .json({ message: "Server error", error: err.message });
    }
};

exports.getWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({
            "members.userId": req.user._id,
        })
            .sort({ updatedAt: -1 })
            .populate("ownerId", "name email picture")
            .populate("members.userId", "name email picture")
            .lean();

        return res.json(workspaces);
    } catch (err) {
        console.error("getWorkspaces error:", err);
        return res
            .status(500)
            .json({ message: "Server error", error: err.message });
    }
};

exports.joinWorkspace = async (req, res) => {
    try {
        const inviteCode = String(req.body?.inviteCode || "")
            .trim()
            .toUpperCase();

        if (!inviteCode) {
            return res.status(400).json({ message: "Invite code is required" });
        }

        const workspace = await Workspace.findOne({ inviteCode });
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        const alreadyMember = workspace.members.some(
            (member) => member.userId.toString() === req.user._id.toString(),
        );

        if (!alreadyMember) {
            workspace.members.push({
                userId: req.user._id,
                role: "member",
            });
            await workspace.save();
        }

        const populated = await Workspace.findById(workspace._id)
            .populate("ownerId", "name email picture")
            .populate("members.userId", "name email picture")
            .lean();

        return res.json(populated);
    } catch (err) {
        console.error("joinWorkspace error:", err);
        return res
            .status(500)
            .json({ message: "Server error", error: err.message });
    }
};

exports.getWorkspaceMembers = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid workspace ID" });
        }

        const workspace = await Workspace.findById(id)
            .populate("members.userId", "name email picture")
            .lean();

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        const isMember = workspace.members.some(
            (member) =>
                String(member.userId?._id || member.userId) ===
                req.user._id.toString(),
        );

        if (!isMember) {
            return res.status(403).json({ message: "Not a workspace member" });
        }

        return res.json({
            _id: workspace._id,
            name: workspace.name,
            inviteCode: workspace.inviteCode,
            members: workspace.members,
        });
    } catch (err) {
        console.error("getWorkspaceMembers error:", err);
        return res
            .status(500)
            .json({ message: "Server error", error: err.message });
    }
};
