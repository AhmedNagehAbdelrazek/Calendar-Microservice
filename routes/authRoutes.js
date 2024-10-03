const express = require("express");
const User = require("../models/userModel");
const AuthenticationService = require("../services/authenticationService");
const router = express.Router();
const {
  googleAuth,
  googleCallback,
  refreshToken,
} = require("../controllers/googleAuthController");
const { authenticateJWT } = require("../middlewares/authMiddleware");

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.post("/refresh-token", authenticateJWT, refreshToken);

router.post("/mock-google", async (req, res) => {
  const { email, name } = req.body;

  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email, name, role: "user" });
    await user.save();
  }

  const token = AuthenticationService.generateJWT(user);
  res.json({ token, userId: user._id });
});

module.exports = router;
