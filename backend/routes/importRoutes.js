const express = require("express");
const auth = require("../middleware/auth");
const controller = require("../controllers/importController");

const router = express.Router();

router.post("/json", auth, controller.importJsonData);
router.get("/accounts", auth, controller.getBankAccounts);
router.post("/accounts", auth, controller.createBankAccount);
router.get("/batches", auth, controller.getImportBatches);
router.get("/batches/:id", auth, controller.getImportBatchDetails);
router.get("/synergy", auth, controller.getImportSynergyOverview);

module.exports = router;
