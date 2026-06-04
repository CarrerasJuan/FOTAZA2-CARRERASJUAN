const express = require("express");
const postController = require("../controllers/postController");
const postWriteController = require("../controllers/postWriteController");
const commentController = require("../controllers/commentController");
const ratingController = require("../controllers/ratingController");
const reportController = require("../controllers/reportController");
const requireSession = require("../middlewares/requireSession");
const { uploadPostImage } = require("../middlewares/postImageUpload");

const router = express.Router();

router.get("/", postController.index);
router.get("/following", requireSession, postController.followingFeed);
router.get("/tags/:tagId(\\d+)", postController.showByTag);
router.get("/create", requireSession, postController.showCreateForm);
router.post("/", requireSession, uploadPostImage, postWriteController.create);
router.post("/:id(\\d+)/comments", requireSession, commentController.create);
router.post("/:id(\\d+)/comments/:commentId(\\d+)/delete", requireSession, commentController.remove);
router.post("/:id(\\d+)/ratings", requireSession, ratingController.ratePost);
router.post("/:id(\\d+)/reports", requireSession, reportController.reportPost);
router.get("/:id(\\d+)/edit", requireSession, postController.showEditForm);
router.post("/:id(\\d+)/edit", requireSession, uploadPostImage, postWriteController.update);
router.post("/:id(\\d+)/delete", requireSession, postController.remove);
router.get("/:id(\\d+)", postController.show);

module.exports = router;
