// routes/expenseRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/expenseController");
const auth = require("../middleware/auth");

// POST   /api/expenses        -> add new expense
router.post("/", auth, controller.addExpense);

// GET    /api/expenses        -> get all (supports query filters)
router.get("/", auth, controller.getExpenses);

// GET    /api/expenses/summary -> summary data
router.get("/summary", auth, controller.getSummary);

// GET    /api/expenses/trends -> spending trends (current vs previous month)
router.get("/trends", auth, controller.getTrends);

// GET    /api/expenses/stats -> user stats
router.get("/stats", auth, controller.getStats);

// POST   /api/expenses/generate-recurring -> generate due recurring expenses
router.post("/generate-recurring", auth, controller.generateRecurringExpenses);

// PUT    /api/expenses/:id    -> update
router.put("/:id", auth, controller.updateExpense);

// DELETE /api/expenses/:id    -> delete
router.delete("/:id", auth, controller.deleteExpense);

module.exports = router;
