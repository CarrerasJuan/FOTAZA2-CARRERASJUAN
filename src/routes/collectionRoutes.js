const express = require("express");
const collectionController = require("../controllers/collectionController");
const requireSession = require("../middlewares/requireSession");

const router = express.Router();

router.get("/", requireSession, collectionController.index);
router.get("/create", requireSession, collectionController.showCreateForm);
router.post("/", requireSession, collectionController.create);
router.get("/:id(\\d+)", requireSession, collectionController.show);
router.post("/:id(\\d+)/items", requireSession, collectionController.addItem);

module.exports = router;
