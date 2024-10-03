// controllers/calendarController.js
const CalendarEvent = require("../models/calendarModel");
const User = require("../models/userModel");
const googleCalendarService = require("../services/googleCalendarService");
const CalendarService = require("../services/calendarService");

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
    const userId = req.user.userId;
    const eventData = {
      ...req.body,
      userId,
    };

    console.log("Event data to be added:", eventData);

    const newEvent = await CalendarService.addEvent(eventData);
    res.json(newEvent);
  } catch (error) {
    console.log("Error adding event:", error);
    res
      .status(500)
      .json({ error: "Failed to add event", details: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updatedEvent = await CalendarService.updateEvent(eventId, req.body);
    res.json(updatedEvent);
  } catch (error) {
    console.log("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
};

exports.listEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    const events = await CalendarService.listEvents(userId);
    res.json(events);
  } catch (error) {
    console.log("Error listing events:", error);
    res.status(500).json({ error: "Failed to list events" });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await CalendarService.getEvent(eventId);
    res.json(event);
  } catch (error) {
    console.log("Error retrieving event:", error);
    res.status(500).json({ error: "Failed to retrieve event" });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const deletedEvent = await CalendarService.deleteEvent(eventId);
    res.json(deletedEvent);
  } catch (error) {
    console.log("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
};

exports.syncEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await CalendarService.syncEvents(userId);
    res.json(result);
  } catch (error) {
    console.log("Error synchronizing events:", error);
    res.status(500).json({ error: "Failed to synchronize events" });
  }
};
