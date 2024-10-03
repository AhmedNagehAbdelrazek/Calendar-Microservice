const AuthenticationService = require("../services/authenticationService");

exports.googleAuth = (req, res) => {
  const authUrl = AuthenticationService.getGoogleAuthUrl();
  res.redirect(authUrl);
};

exports.googleCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const token = await AuthenticationService.handleGoogleCallback(code);
    res.json({ token });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming you have middleware to extract user from JWT
    const newCredentials = await AuthenticationService.refreshGoogleToken(
      userId
    );
    res.json({ credentials: newCredentials });
  } catch (error) {
    console.error("Token Refresh Error:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
};
