const express = require("express");
const interestController = require("../controllers/interestController");

const router = express.Router();

router.get("/", interestController.index);

module.exports = router;
