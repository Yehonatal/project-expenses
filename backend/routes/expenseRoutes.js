// routes/expenseRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/expenseController");

// POST   /api/expenses        -> add new expense
router.post("/", controller.addExpense);

// GET    /api/expenses        -> get all (supports query filters)
router.get("/", controller.getExpenses);

// GET    /api/expenses/summary -> summary data
router.get("/summary", controller.getSummary);

// PUT    /api/expenses/:id    -> update
router.put("/:id", controller.updateExpense);

// DELETE /api/expenses/:id    -> delete
router.delete("/:id", controller.deleteExpense);

module.exports = router;
