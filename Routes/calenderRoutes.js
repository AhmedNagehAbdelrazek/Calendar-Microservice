const express = require("express");
const {
  addEvent,
  listEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  syncEvents,
} = require("../Controller/calenderController");

const router = express.Router();

router.post("/add", addEvent);
router.get("/list/:userId", listEvents);
router.get("/:eventId", getEventById);
router.put("/:eventId", updateEvent);
router.delete("/:eventId", deleteEvent);
router.post("/sync/:userId", syncEvents);

module.exports = router;
