const express = require("express");
const router = express.Router();
const controller = require("../controllers/typesController");

router.get("/", controller.getTypes);
router.post("/", controller.addType);

module.exports = router;
