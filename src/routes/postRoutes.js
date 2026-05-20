const express = require("express");
const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController");
const requireSession = require("../middlewares/requireSession");

const router = express.Router();

router.get("/", postController.index);
router.get("/create", requireSession, postController.showCreateForm);
router.post("/", requireSession, postController.create);
router.post("/:id/comments", requireSession, commentController.create);
router.get("/:id/edit", requireSession, postController.showEditForm);
router.post("/:id/edit", requireSession, postController.update);
router.post("/:id/delete", requireSession, postController.remove);
router.get("/:id", postController.show);

module.exports = router;
