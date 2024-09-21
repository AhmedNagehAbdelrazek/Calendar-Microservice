// controllers/calendarController.js
const CalendarEvent = require("../Model/calenderModel");
const User = require("../Model/userModel");
const googleCalendarService = require("../Service/googleCalenderService");

/**
 * Adds a new calendar event to the local database and synchronizes it with the user's Google Calendar.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing the event details.
 * @param {string} req.body.title - The title of the event.
 * @param {string} req.body.description - The description of the event.
 * @param {string} req.body.startDateTime - The start date and time of the event.
 * @param {string} req.body.endDateTime - The end date and time of the event.
 * @param {string} req.body.location - The location of the event.
 * @param {string} req.body.userId - The ID of the user creating the event.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<Object>} - The newly created calendar event.
 */
exports.addEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      startDateTime,
      endDateTime,
      location,
      userId,
      reminderLeadTime,
    } = req.body;

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

    res.json(newEvent);
  } catch (error) {
    console.log("Error adding event to Google Calendar:", error);
    res.status(500).json({ error: "Failed to add event" });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      title,
      description,
      startDateTime,
      endDateTime,
      location,
      reminderLeadTime,
    } = req.body;

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
      return res.status(404).json({ error: "Event not found" });
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

    res.json(updatedEvent);
  } catch (error) {
    console.log("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
};

exports.listEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    const events = await CalendarEvent.find({ userId });
    res.json(events);
  } catch (error) {
    console.log("Error listing events:", error);
    res.status(500).json({ error: "Failed to list events" });
  }
};

exports.googleEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await CalendarEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.log("Error retrieving event:", error);
    res.status(500).json({ error: "Failed to retrieve event" });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find and delete the event from the local database
    const event = await CalendarEvent.findByIdAndDelete(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Delete the event from the user's Google Calendar
    await googleCalendarService.deleteEvent(
      event.userId,
      "primary",
      event.googleCalendarEventId
    );

    res.json(event);
  } catch (error) {
    console.log("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
};

exports.syncEvents = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all events for the specified user
    const googleEvents = await googleCalendarService.listEvents(
      userId,
      "primary"
    );

    // Sync events with the local database
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

    res.json({ message: "Events synchronized successfully" });
  } catch (error) {
    console.log("Error synchronizing events:", error);
    res.status(500).json({ error: "Failed to synchronize events" });
  }
};
