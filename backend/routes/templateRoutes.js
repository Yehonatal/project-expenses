const express = require("express");
const router = express.Router();
const controller = require("../controllers/templateController");
const auth = require("../middleware/auth");

// GET /api/templates
router.get("/", auth, controller.getTemplates);

// POST /api/templates
router.post("/", auth, controller.addTemplate);

// DELETE /api/templates/:id
router.delete("/:id", auth, controller.deleteTemplate);

module.exports = router;
