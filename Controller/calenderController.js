// controllers/calendarController.js
const CalendarEvent = require('../Model/calenderModel');
const User = require('../Model/userModel');
const googleCalendarService = require('../Service/googleCalenderService');


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
    const { title, description, startDateTime, endDateTime, location, userId, reminderLeadTime } = req.body;

    // Create event in local database
    const newEvent = new CalendarEvent({
      title,
      description,
      startDateTime,
      endDateTime,
      location,
      userId
    });
    await newEvent.save();

    // Add event to Google Calendar
    const googleEvent = {
      summary: title,
      description,
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime },
      location,
      reminderLeadTime: { minutes: reminderLeadTime || 30} // Default to 30 minutes if not specified
    };
    const result = await googleCalendarService.addEvent(userId, 'primary', googleEvent, reminderLeadTime);

    // Update local event with Google Calendar ID
    newEvent.googleCalendarEventId = result.id;
    newEvent.isSync = true;
    await newEvent.save();

    res.json(newEvent);
  } catch (error) {
    console.log('Error adding event to Google Calendar:', error);
    res.status(500).json({ error: 'Failed to add event' });
  }
};



