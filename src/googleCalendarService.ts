import { google, calendar_v3 } from "googleapis";
import { Credentials } from "google-auth-library";
import OAuthService from "./oauthService";

class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;
  private oauthService: OAuthService;

  constructor(oauthService: OAuthService) {
    this.calendar = google.calendar({ version: "v3" });
    this.oauthService = oauthService;
  }

  async addEvent(
    token: Credentials,
    calendarId: string = "primary",
    event: calendar_v3.Schema$Event
  ): Promise<calendar_v3.Schema$Event> {
    const oauth2Client = this.oauthService.getOAuthClient();
    oauth2Client.setCredentials(token);

    const response = await this.calendar.events.insert({
      auth: oauth2Client,
      calendarId,
      requestBody: event,
      sendUpdates: "all",
    });
    return response.data;
  }

  async updateEvent(
    token: Credentials,
    calendarId: string = "primary",
    eventId: string,
    event: calendar_v3.Schema$Event
  ): Promise<calendar_v3.Schema$Event> {
    const oauth2Client = this.oauthService.getOAuthClient();
    oauth2Client.setCredentials(token);

    const response = await this.calendar.events.update({
      auth: oauth2Client,
      calendarId,
      eventId,
      requestBody: event,
      sendUpdates: "all",
    });
    return response.data;
  }

  async deleteEvent(
    token: Credentials,
    calendarId: string = "primary",
    eventId: string
  ): Promise<void> {
    const oauth2Client = this.oauthService.getOAuthClient();
    oauth2Client.setCredentials(token);

    await this.calendar.events.delete({
      auth: oauth2Client,
      calendarId,
      eventId,
    });
  }

  async listEvents(
    token: Credentials,
    calendarId: string = "primary",
    timeMin: string,
    timeMax: string
  ): Promise<calendar_v3.Schema$Event[]> {
    const oauth2Client = this.oauthService.getOAuthClient();
    oauth2Client.setCredentials(token);

    const response = await this.calendar.events.list({
      auth: oauth2Client,
      calendarId,
      timeMin,
      timeMax,
    });
    return response.data.items || [];
  }
}

export default GoogleCalendarService;
