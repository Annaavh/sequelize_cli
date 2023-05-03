const express = require("express");
const {
  register,
  login,
  refreshToken,
  getAllUsers,
} = require("../controllers/usersController");
const router = express.Router();
const validateToken = require("../middlewares/validateToken");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh_token", refreshToken);
router.get("/getAllUsers", validateToken, getAllUsers);

module.exports = router;
