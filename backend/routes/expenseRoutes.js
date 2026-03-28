// routes/expenseRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/expenseController");
const auth = require("../middleware/auth");

// POST   /api/expenses        -> add new expense
router.post("/", auth, controller.addExpense);

// GET    /api/expenses        -> get all (supports query filters)
router.get("/", auth, controller.getExpenses);

// GET    /api/expenses/filter-presets -> list saved filter presets
router.get("/filter-presets", auth, controller.getExpenseFilterPresets);

// POST   /api/expenses/filter-presets -> create or overwrite a saved filter preset
router.post("/filter-presets", auth, controller.createExpenseFilterPreset);

// DELETE /api/expenses/filter-presets/:id -> delete a saved filter preset
router.delete(
    "/filter-presets/:id",
    auth,
    controller.deleteExpenseFilterPreset,
);

// PATCH  /api/expenses/filter-presets/:id/default -> mark preset as default
router.patch(
    "/filter-presets/:id/default",
    auth,
    controller.setDefaultExpenseFilterPreset,
);

// GET    /api/expenses/summary -> summary data
router.get("/summary", auth, controller.getSummary);

// GET    /api/expenses/dashboard -> summary data for dashboard
router.get("/dashboard", auth, controller.getDashboard);

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
