const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

class AuthenticationService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  getGoogleAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
      prompt: "consent",
    });
  }

  async handleGoogleCallback(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: this.oauth2Client });
    const { data } = await oauth2.userinfo.get();

    let user = await User.findOne({ email: data.email });
    if (!user) {
      user = new User({
        email: data.email,
        name: data.name,
        picture: data.picture,
        role: "user", // Default role
      });
    }

    user.googleToken = tokens;
    await user.save();

    return this.generateJWT(user);
  }

  generateJWT(user) {
    return jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
  }

  async refreshGoogleToken(userId) {
    const user = await User.findById(userId);
    if (!user || !user.googleToken) {
      throw new Error("User not found or Google token not available");
    }

    this.oauth2Client.setCredentials({
      refresh_token: user.googleToken.refresh_token,
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();
    user.googleToken = credentials;
    await user.save();

    return credentials;
  }

  verifyJWT(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  async checkAuthorization(userId, requiredRole) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== requiredRole && user.role !== "admin") {
      throw new Error("Unauthorized access");
    }

    return true;
  }
}

module.exports = new AuthenticationService();
