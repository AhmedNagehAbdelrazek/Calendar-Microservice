const express = require("express");
const {
  authenticateJWT,
  authorizeRole,
} = require("../middlewares/authMiddleware");
const {
  addEvent,
  listEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  syncEvents,
} = require("../controllers/calendarController");

const router = express.Router();

router.use(authenticateJWT); // All routes in this file are protected

router.post("/add", authorizeRole("user"), addEvent);
router.get("/list/:userId", authorizeRole("user"), listEvents);
router.get("/:eventId", authorizeRole("user"), getEventById);
router.put("/:eventId", authorizeRole("user"), updateEvent);
router.delete("/:eventId", authorizeRole("user"), deleteEvent);
router.post("/sync/:userId", authorizeRole("user"), syncEvents);

module.exports = router;
