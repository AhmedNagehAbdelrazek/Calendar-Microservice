require(`dotenv`).config();
const { google } = require("googleapis");
const User = require("../Model/userModel");

/**
 * Provides a service for interacting with the Google Calendar API on behalf of a user.
 */

class GoogleCalendarService {
  /**
   * Constructs a new GoogleCalendarService instance.
   *
   * The constructor initializes the OAuth2 client with the necessary credentials from the environment.
   */
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Retrieves the calendar for the specified user.
   *
   * @param {string} userId - The ID of the user to retrieve the calendar for.
   * @returns {Promise<google.calendar_v3.Calendar>} - The calendar for the specified user.
   * @throws {Error} - If the user is not found or the Google token is not available.
   */

  async getCalendarForUser(userId) {
    const user = await User.findById(userId);
    if (!user || !user.googleToken) {
      console.log("Fetching calendar for user ID:", userId);
      throw new Error("User not found or Google token not available");
    }

    this.oauth2Client.setCredentials(user.googleToken);
    return google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });
  }

  /**
   * Adds an event to the specified user's calendar.
   *
   * @param {string} userId - The ID of the user to add the event to.
   * @param {string} [calendarId='primary'] - The ID of the calendar to add the event to.
   * @param {google.calendar_v3.Schema$Event} event - The event to add.
   * @returns {Promise<google.calendar_v3.Schema$Event>} - The added event.
   */

  async addEvent(userId, calendarId = "primary", event, reminderLeadTime) {
    const calendar = await this.getCalendarForUser(userId);
    event.reminders = {
      useDefault: false,
      overrides: [{ method: "email", minutes: reminderLeadTime }],
    };

    const res = await calendar.events.insert({
      calendarId,
      resource: event,
    });
    return res.data;
  }

  async updateEvent(userId, calendarId = "primary", eventId, event) {
    const calendar = await this.getCalendarForUser(userId);
    const res = await calendar.events.update({
      calendarId,
      eventId,
      resource: event,
    });
    return res.data;
  }

  async deleteEvent(userId, calendarId = "primary", eventId) {
    const calendar = await this.getCalendarForUser(userId);
    await calendar.events.delete({
      calendarId,
      eventId,
    });
  }

  async listEvents(userId, calendarId = "primary") {
    const calendar = await this.getCalendarForUser(userId);
    const res = await calendar.events.list({
      calendarId,
    });
    return res.data.items;
  }
}

module.exports = new GoogleCalendarService();
