// controllers/authController.js
const { google } = require('googleapis');
const User = require('../Model/userModel');

/**
 * Handles Google OAuth2 authentication flow for the application.
 * 
 * The `googleAuth` function generates a Google OAuth2 authorization URL and redirects the user to it.
 * The `googleCallback` function handles the callback from Google after the user authorizes the application.
 * It exchanges the authorization code for access and refresh tokens, retrieves the user's profile information,
 * and either creates a new user or updates an existing user's Google token in the database.
 * The `logout` function redirects the user to the home page.
 */
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes for Google Calendar and user info
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

exports.googleAuth = (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // This ensures we always get a refresh token
  });
  res.redirect(authUrl);
};

exports.googleCallback = async (req, res) => {
  const { code } = req.query;
  
  try {
    // Exchange the code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    // Find or create user
    let user = await User.findOne({ email: data.email });
    if (!user) {
      user = new User({
        email: data.email,
        name: data.name,
        picture: data.picture
      });
    }

    // Update user's Google token
    user.googleToken = tokens;
    await user.save();

    res.redirect('/auth-success');
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

exports.logout = (req, res) => {
  res.redirect('/');
};