require("dotenv").config();
const express = require("express");
const connectDB = require("./config/connectDb");
const calendarRoutes = require("./routes/calendarRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
connectDB();

app.use(express.json());

app.use("/api/calendar", calendarRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Calendar microservice running on port ${PORT}`);
});
