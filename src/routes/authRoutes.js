const express = require("express");
const authController = require("../controllers/authController");
const guestOnly = require("../middlewares/guestOnly");

const router = express.Router();

router.get("/", authController.index);
router.get("/login", guestOnly, authController.showLogin);
router.post("/login", guestOnly, authController.login);
router.get("/register", guestOnly, authController.showRegister);
router.post("/register", guestOnly, authController.register);
router.post("/logout", authController.logout);

module.exports = router;
