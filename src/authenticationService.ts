import jwt from "jsonwebtoken";
import { OAuth2Client, Credentials } from "google-auth-library";
import OAuthService from "./oauthService";

class AuthenticationService {
  private oauthService: OAuthService;
  private jwtSecret: string;

  constructor(oauthService: OAuthService, jwtSecret: string) {
    this.oauthService = oauthService;
    this.jwtSecret = jwtSecret;
  }
  generateAuthUrl(): string {
    const oauth2Client = this.oauthService.getOAuthClient();
    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    });
  }

  async getTokens(code: string): Promise<Credentials> {
    const oauth2Client = this.oauthService.getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }

  generateJWT(payload: object): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: "1h",
    });
  }

  async refreshToken(refreshToken: string): Promise<Credentials> {
    const oauth2Client = this.oauthService.getOAuthClient();
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  }
}

export default AuthenticationService;
