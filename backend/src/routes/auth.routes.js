const express = require("express")
const authController = require("../controllers/auth.controller")
const { protect } = require("../middlewares/auth.middleware")

const router = express.Router();

router.post("/register", authController.registerUser)
router.post("/login", authController.loginUser)
router.get("/me", protect, authController.checkAuth)

module.exports = router