import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

class OAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  getOAuthClient(): OAuth2Client {
    return new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );
  }
}

export default OAuthService;
