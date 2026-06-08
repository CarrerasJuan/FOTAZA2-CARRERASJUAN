const express = require("express");
const userController = require("../controllers/userController");
const followController = require("../controllers/followController");
const requireSession = require("../middlewares/requireSession");
const { uploadAvatar } = require("../middlewares/avatarUpload");

const router = express.Router();

router.post("/:id(\\d+)/follow", requireSession, followController.followUser);
router.post("/:id(\\d+)/unfollow", requireSession, followController.unfollowUser);
router.get("/:id(\\d+)/edit", requireSession, userController.showEditForm);
router.post("/:id(\\d+)/edit", requireSession, uploadAvatar, userController.update);
router.get("/:id(\\d+)", requireSession, userController.show);

module.exports = router;
