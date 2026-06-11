const express = require("express");
const messageController = require("../controllers/messageController");
const requireSession = require("../middlewares/requireSession");

const router = express.Router();

router.get("/:interestId(\\d+)/chat", requireSession, messageController.showChat);
router.post("/:interestId(\\d+)/chat", requireSession, messageController.sendMessage);

module.exports = router;
