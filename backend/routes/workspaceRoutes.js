const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/workspaceController");

router.get("/", auth, controller.getWorkspaces);
router.post("/", auth, controller.createWorkspace);
router.post("/join", auth, controller.joinWorkspace);
router.get("/:id/members", auth, controller.getWorkspaceMembers);

module.exports = router;
