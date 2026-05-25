const express = require("express");
const validatorController = require("../controllers/validatorController");
const requireSession = require("../middlewares/requireSession");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

router.use(requireSession, requireRole("validator"));

router.get("/", validatorController.index);
router.post("/posts/:postId(\\d+)/dismiss-reports", validatorController.dismissReports);
router.post("/posts/:postId(\\d+)/deactivate", validatorController.deactivatePost);

module.exports = router;
