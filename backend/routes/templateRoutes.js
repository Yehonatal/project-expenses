const express = require("express");
const router = express.Router();
const controller = require("../controllers/templateController");

// GET /api/templates
router.get("/", controller.getTemplates);

// POST /api/templates
router.post("/", controller.addTemplate);

// DELETE /api/templates/:id
router.delete("/:id", controller.deleteTemplate);

module.exports = router;
