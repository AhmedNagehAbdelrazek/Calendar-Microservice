const CalendarEvent = require("../models/calendarModel");
const googleCalendarService = require("./googleCalendarService");

class CalendarService {
  async addEvent(eventData) {
    const {
      title,
      description,
      startDateTime,
      endDateTime,
      location,
      userId,
      reminderLeadTime,
    } = eventData;

    // Create event in local database
    const newEvent = new CalendarEvent({
      title,
      description,
      startDateTime,
      endDateTime,
      location,
      userId,
    });
    await newEvent.save();

    // Add event to Google Calendar
    const googleEvent = {
      summary: title,
      description,
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime },
      location,
      reminderLeadTime: { minutes: reminderLeadTime || 30 }, // Default to 30 minutes if not specified
    };
    const result = await googleCalendarService.addEvent(
      userId,
      "primary",
      googleEvent,
      reminderLeadTime
    );

    // Update local event with Google Calendar ID
    newEvent.googleCalendarEventId = result.id;
    newEvent.isSync = true;
    await newEvent.save();

    return newEvent;
  }

  async updateEvent(eventId, eventData) {
    const {
      title,
      description,
      startDateTime,
      endDateTime,
      location,
      reminderLeadTime,
    } = eventData;

    // Find and update event in local database
    const updatedEvent = await CalendarEvent.findByIdAndUpdate(
      eventId,
      {
        title,
        description,
        startDateTime,
        endDateTime,
        location,
      },
      { new: true }
    );

    if (!updatedEvent) {
      throw new Error("Event not found");
    }

    // Update event in Google Calendar
    const googleEvent = {
      summary: title,
      description,
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime },
      location,
      reminders: {
        useDefault: false,
        overrides: [{ method: "email", minutes: reminderLeadTime || 30 }], // Default to 30 minutes if not specified
      },
    };
    await googleCalendarService.updateEvent(
      updatedEvent.userId,
      "primary",
      updatedEvent.googleCalendarEventId,
      googleEvent
    );

    return updatedEvent;
  }

  async listEvents(userId) {
    return await CalendarEvent.find({ userId });
  }

  async getEvent(eventId) {
    const event = await CalendarEvent.findById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    return event;
  }

  async deleteEvent(eventId) {
    const event = await CalendarEvent.findByIdAndDelete(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Delete event from the user's Google Calendar
    await googleCalendarService.deleteEvent(
      event.userId,
      "primary",
      event.googleCalendarEventId
    );

    return event;
  }

  async syncEvents(userId) {
    const googleEvents = await googleCalendarService.listEvents(
      userId,
      "primary"
    );
    for (const googleEvent of googleEvents) {
      const existingEvent = await CalendarEvent.findOne({
        googleCalendarEventId: googleEvent.id,
      });

      if (!existingEvent) {
        // Create new event in local database
        const newEvent = new CalendarEvent({
          title: googleEvent.summary,
          description: googleEvent.description,
          startDateTime: googleEvent.start.dateTime,
          endDateTime: googleEvent.end.dateTime,
          location: googleEvent.location,
          userId,
          googleCalendarEventId: googleEvent.id,
          isSync: true,
        });
        await newEvent.save();
      }
    }

    return { message: "Events synchronized successfully" };
  }
}

module.exports = new CalendarService();
