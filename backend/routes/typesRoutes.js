const express = require("express");
const router = express.Router();
const controller = require("../controllers/typesController");
const auth = require("../middleware/auth");

router.get("/", auth, controller.getTypes);
router.post("/", auth, controller.addType);

module.exports = router;
