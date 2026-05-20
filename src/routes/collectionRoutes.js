const express = require("express");
const collectionController = require("../controllers/collectionController");

const router = express.Router();

router.get("/", collectionController.index);

module.exports = router;
