const express = require("express");
const userController = require("../controllers/userController");
const followController = require("../controllers/followController");
const requireSession = require("../middlewares/requireSession");

const router = express.Router();

router.post("/:id(\\d+)/follow", requireSession, followController.followUser);
router.post("/:id(\\d+)/unfollow", requireSession, followController.unfollowUser);
router.get("/:id(\\d+)", userController.show);

module.exports = router;
