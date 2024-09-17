// server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/connectDb');
const calendarRoutes = require('./Routes/calenderRoutes');
const authRoutes = require('./Routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
connectDB();

app.use(express.json());

app.use('/api/calendar', calendarRoutes);
app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Calendar microservice running on port ${PORT}`);
});