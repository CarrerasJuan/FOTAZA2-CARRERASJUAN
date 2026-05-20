const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/:id(\\d+)", userController.show);

module.exports = router;
