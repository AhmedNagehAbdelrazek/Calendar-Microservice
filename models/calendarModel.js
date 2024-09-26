const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const CalendarEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDateTime: {
      type: Date,
      required: true,
    },
    endDateTime: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    googleCalendarEventId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isSync: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const CalendarEvent = mongoose.model("CalendarEvent", CalendarEventSchema);

module.exports = CalendarEvent;
