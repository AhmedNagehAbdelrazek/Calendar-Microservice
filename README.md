# Google Calendar Service

A TypeScript package for easy integration with Google Calendar API, providing a simple interface for authentication and calendar operations.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Authentication](#authentication)
  - [Adding an Event](#adding-an-event)
  - [Updating an Event](#updating-an-event)
  - [Deleting an Event](#deleting-an-event)
  - [Listing Events](#listing-events)
  - [Getting a Single Event](#getting-a-single-event)

## Features

- Easy OAuth2 authentication with Google
- Singleton pattern for efficient resource management
- TypeScript support for better developer experience
- Comprehensive coverage of Google Calendar operations:
  - Add events
  - Update events
  - Delete events
  - List events
  - Get single event details

## Installation

To install the package, run the following command in your project directory:

```bash
npm install google-calendar-service
```

## Usage

First, import the `GoogleCalendarAuthService` from the package:

```typescript
import { GoogleCalendarAuthService } from "google-calendar-service";
```

### Authentication

Initialize the service with your Google API credentials:

```typescript
const clientId = "YOUR_CLIENT_ID";
const clientSecret = "YOUR_CLIENT_SECRET";
const redirectUri = "YOUR_REDIRECT_URI";

const calendarService = GoogleCalendarAuthService.getInstance(
  clientId,
  clientSecret,
  redirectUri
);
```

Generate an authentication URL:

```typescript
const authUrl = calendarService.generateAuthUrl();
console.log("Please visit this URL to authorize the application:", authUrl);
```

After the user grants permission, exchange the received code for tokens:

```typescript
const code = "AUTHORIZATION_CODE_FROM_REDIRECT";
const tokens = await calendarService.getTokens(code);
```

### Adding an Event

```typescript
const event = {
  summary: "Team Meeting",
  location: "Conference Room 1",
  description: "Monthly team sync-up",
  start: {
    dateTime: "2023-07-01T09:00:00-07:00",
    timeZone: "America/Los_Angeles",
  },
  end: {
    dateTime: "2023-07-01T10:00:00-07:00",
    timeZone: "America/Los_Angeles",
  },
};

const createdEvent = await calendarService.addEvent(tokens, "primary", event);
console.log("Event created:", createdEvent);
```

### Updating an Event

```typescript
const eventId = "EXISTING_EVENT_ID";
const updatedEvent = {
  summary: "Updated Team Meeting",
  description: "Monthly team sync-up with new agenda",
};

const updated = await calendarService.updateEvent(
  tokens,
  "primary",
  eventId,
  updatedEvent
);
console.log("Event updated:", updated);
```

### Deleting an Event

```typescript
const eventId = "EVENT_ID_TO_DELETE";
await calendarService.deleteEvent(tokens, "primary", eventId);
console.log("Event deleted successfully");
```

### Listing Events

```typescript
const timeMin = new Date().toISOString();
const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // One week from now

const events = await calendarService.listEvents(
  tokens,
  "primary",
  timeMin,
  timeMax
);
console.log("Upcoming events:", events);
```

### Getting a Single Event

```typescript
const eventId = "EVENT_ID_TO_RETRIEVE";
const event = await calendarService.getEvent(tokens, "primary", eventId);
console.log("Event details:", event);
```
