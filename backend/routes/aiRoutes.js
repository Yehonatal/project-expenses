const express = require("express");
const {
    parseExpense,
    parseTemplate,
    parseBudget,
    parseRecurring,
} = require("../controllers/aiController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// POST /api/ai/parse-expense
router.post("/parse-expense", authenticateToken, parseExpense);

// POST /api/ai/parse-template
router.post("/parse-template", authenticateToken, parseTemplate);

// POST /api/ai/parse-budget
router.post("/parse-budget", authenticateToken, parseBudget);

// POST /api/ai/parse-recurring
router.post("/parse-recurring", authenticateToken, parseRecurring);

module.exports = router;
