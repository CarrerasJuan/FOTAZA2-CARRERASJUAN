const express = require("express");
const interestController = require("../controllers/interestController");
const requireSession = require("../middlewares/requireSession");

const router = express.Router();

router.get("/", requireSession, interestController.index);
router.post("/", requireSession, interestController.create);
router.post("/:postId(\\d+)/delete", requireSession, interestController.remove);

module.exports = router;
