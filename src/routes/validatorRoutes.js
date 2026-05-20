const express = require("express");
const validatorController = require("../controllers/validatorController");

const router = express.Router();

router.get("/", validatorController.index);

module.exports = router;
