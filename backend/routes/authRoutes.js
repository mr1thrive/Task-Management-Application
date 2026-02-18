const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware"); 

const {
  register,
  login,
  forgotPassword,
  recoverEmail,
  changePassword, 
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/recover-email", recoverEmail);
router.put("/change-password", auth, changePassword);

module.exports = router;
