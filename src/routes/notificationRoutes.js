const express = require("express");
const notificationController = require("../controllers/notificationController");
const requireSession = require("../middlewares/requireSession");

const router = express.Router();

router.get("/", requireSession, notificationController.index);
router.post("/:id(\\d+)/read", requireSession, notificationController.markAsRead);

module.exports = router;
