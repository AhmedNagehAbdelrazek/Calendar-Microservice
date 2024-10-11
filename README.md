# Google Calendar Service

A TypeScript package for easy integration with Google Calendar API.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [OAuth2 Setup](#oauth2-setup)
- [Usage](#usage)
  - [Initializing the Service](#initializing-the-service)
  - [Adding an Event](#adding-an-event)
  - [Updating an Event](#updating-an-event)
  - [Deleting an Event](#deleting-an-event)
  - [Listing Events](#listing-events)
  - [Getting a Single Event](#getting-a-single-event)
- [Error Handling](#error-handling)
- [Contributing](#contributing)
- [License](#license)

## Installation

Install the package using npm:

```bash
npm install google-calendar-service
```

## Configuration

### Environment Variables

Create a `.env` file in your project root and add the following variables:

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri
```

### OAuth2 Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Enable the Google Calendar API for your project.
4. Create OAuth 2.0 credentials (OAuth client ID).
5. Set the authorized redirect URIs.
6. Download the client configuration and use it to set up your environment variables.

## Usage

### Initializing the Service

```typescript
import { GoogleCalendarService } from "google-calendar-service";
import { OAuth2Client } from "google-auth-library";

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set credentials (after user authentication)
oauth2Client.setCredentials(/* user's tokens */);

const calendarService = new GoogleCalendarService(oauth2Client);
```

### Adding an Event

```typescript
const newEvent = {
  summary: "Team Meeting",
  location: "Conference Room 1",
  description: "Discuss Q2 goals",
  start: {
    dateTime: "2024-10-15T09:00:00-07:00",
    timeZone: "America/Los_Angeles",
  },
  end: {
    dateTime: "2024-10-15T10:00:00-07:00",
    timeZone: "America/Los_Angeles",
  },
};

try {
  const createdEvent = await calendarService.addEvent("primary", newEvent);
  console.log("Event created:", createdEvent);
} catch (error) {
  console.error("Error creating event:", error);
}
```

### Updating an Event

```typescript
const eventId = "your_event_id";
const updatedEvent = {
  summary: "Updated Team Meeting",
  description: "Discuss Q2 goals and project timeline",
};

try {
  const updated = await calendarService.updateEvent(
    "primary",
    eventId,
    updatedEvent
  );
  console.log("Event updated:", updated);
} catch (error) {
  console.error("Error updating event:", error);
}
```

### Deleting an Event

```typescript
const eventId = "your_event_id";

try {
  await calendarService.deleteEvent("primary", eventId);
  console.log("Event deleted successfully");
} catch (error) {
  console.error("Error deleting event:", error);
}
```

### Listing Events

```typescript
const timeMin = new Date().toISOString();
const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // One week from now

try {
  const events = await calendarService.listEvents("primary", timeMin, timeMax);
  console.log("Upcoming events:", events.items);

  // Handle pagination
  if (events.nextPageToken) {
    const nextPageEvents = await calendarService.listEvents(
      "primary",
      timeMin,
      timeMax,
      events.nextPageToken
    );
    console.log("Next page events:", nextPageEvents.items);
  }
} catch (error) {
  console.error("Error listing events:", error);
}
```

### Getting a Single Event

```typescript
const eventId = "your_event_id";

try {
  const event = await calendarService.getEvent("primary", eventId);
  console.log("Event details:", event);
} catch (error) {
  console.error("Error getting event:", error);
}
```

## Error Handling

The package uses custom `CalendarApiError` for error handling. Always wrap your calls in try-catch blocks to handle potential errors:

```typescript
try {
  // Your calendar service method call
} catch (error) {
  if (error instanceof CalendarApiError) {
    console.error("Calendar API Error:", error.message);
    console.error("Original Error:", error.originalError);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
