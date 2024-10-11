import { OAuth2Client } from "google-auth-library";
import { google, calendar_v3 } from "googleapis";
import { Event } from "./types";

export class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;

  constructor(private readonly oauth2Client: OAuth2Client) {
    this.calendar = google.calendar({ version: "v3", auth: this.oauth2Client });
  }

  public async addEvent(
    calendarId: string = "primary",
    event: Event
  ): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: event,
        sendUpdates: "all",
      });
      return response.data;
    } catch (error) {
      throw new CalendarApiError("Failed to add event", error);
    }
  }

  public async updateEvent(
    calendarId: string = "primary",
    eventId: string,
    event: Event
  ): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        requestBody: event,
        sendUpdates: "all",
      });
      return response.data;
    } catch (error) {
      throw new CalendarApiError("Failed to update event", error);
    }
  }

  public async deleteEvent(
    calendarId: string = "primary",
    eventId: string
  ): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId,
      });
    } catch (error) {
      throw new CalendarApiError("Failed to delete event", error);
    }
  }

  public async listEvents(
    calendarId: string = "primary",
    timeMin: string,
    timeMax: string,
    pageToken?: string,
    maxResults: number = 100
  ): Promise<calendar_v3.Schema$Events> {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        pageToken,
        maxResults,
      });
      return response.data;
    } catch (error) {
      throw new CalendarApiError("Failed to list events", error);
    }
  }

  public async getEvent(
    calendarId: string = "primary",
    eventId: string
  ): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.get({
        calendarId,
        eventId,
      });
      return response.data;
    } catch (error) {
      throw new CalendarApiError("Failed to get event", error);
    }
  }
}

class CalendarApiError extends Error {
  constructor(message: string, public readonly originalError: any) {
    super(message);
    this.name = "CalendarApiError";
  }
}
