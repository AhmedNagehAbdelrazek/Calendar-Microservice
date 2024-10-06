import { OAuth2Client, Credentials } from "google-auth-library";
import { google, calendar_v3 } from "googleapis";

export class GoogleCalendarAuthService {
  private static instance: GoogleCalendarAuthService;
  private oauth2Client: OAuth2Client;
  private calendar: calendar_v3.Calendar;

  private constructor(
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
    this.calendar = google.calendar({ version: "v3" });
  }

  public static getInstance(
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): GoogleCalendarAuthService {
    if (!GoogleCalendarAuthService.instance) {
      GoogleCalendarAuthService.instance = new GoogleCalendarAuthService(
        clientId,
        clientSecret,
        redirectUri
      );
    }

    return GoogleCalendarAuthService.instance;
  }

  public generateAuthUrl(): string {
    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    });
  }

  public async getTokens(code: string): Promise<Credentials> {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  public async addEvent(
    token: Credentials,
    calendarId: string = "primary",
    event: calendar_v3.Schema$Event
  ): Promise<calendar_v3.Schema$Event> {
    this.oauth2Client.setCredentials(token);

    const response = await this.calendar.events.insert({
      auth: this.oauth2Client,
      calendarId,
      requestBody: event,
      sendUpdates: "all",
    });
    return response.data;
  }

  public async updateEvent(
    token: Credentials,
    calendarId: string = "primary",
    eventId: string,
    event: calendar_v3.Schema$Event
  ): Promise<calendar_v3.Schema$Event> {
    this.oauth2Client.setCredentials(token);

    const response = await this.calendar.events.update({
      auth: this.oauth2Client,
      calendarId,
      eventId,
      requestBody: event,
      sendUpdates: "all",
    });
    return response.data;
  }

  public async deleteEvent(
    token: Credentials,
    calendarId: string = "primary",
    eventId: string
  ): Promise<void> {
    this.oauth2Client.setCredentials(token);

    await this.calendar.events.delete({
      auth: this.oauth2Client,
      calendarId,
      eventId,
    });
  }

  public async listEvents(
    token: Credentials,
    calendarId: string = "primary",
    timeMin: string,
    timeMax: string
  ): Promise<calendar_v3.Schema$Event[]> {
    this.oauth2Client.setCredentials(token);

    const response = await this.calendar.events.list({
      auth: this.oauth2Client,
      calendarId,
      timeMin,
      timeMax,
    });
    return response.data.items || [];
  }

  public async getEvent(
    token: Credentials,
    calendarId: string = "primary",
    eventId: string
  ): Promise<calendar_v3.Schema$Event> {
    this.oauth2Client.setCredentials(token);

    const response = await this.calendar.events.get({
      auth: this.oauth2Client,
      calendarId,
      eventId,
    });
    return response.data;
  }
}
