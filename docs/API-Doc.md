# Calendar Microservice API Documentation

## Authentication

All API endpoints require authentication. Include an Authorization header with a valid JWT token:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Users

#### Create a new user

```
POST /users
```

Body:

```json
{
  "username": "string",
  "email": "string",
  "google_account_id": "string"
}
```

Response: 201 Created

```json
{
  "user_id": "integer",
  "username": "string",
  "email": "string",
  "google_account_id": "string"
}
```

#### Get user details

```
GET /users/{user_id}
```

Response: 200 OK

```json
{
  "user_id": "integer",
  "username": "string",
  "email": "string",
  "google_account_id": "string"
}
```

### Calendars

#### Create a new calendar

```
POST /users/{user_id}/calendars
```

Body:

```json
{
  "name": "string",
  "description": "string",
  "color": "string",
  "is_primary": "boolean"
}
```

Response: 201 Created

```json
{
  "calendar_id": "integer",
  "user_id": "integer",
  "name": "string",
  "description": "string",
  "color": "string",
  "is_primary": "boolean"
}
```

#### Get user's calendars

```
GET /users/{user_id}/calendars
```

Response: 200 OK

```json
[
  {
    "calendar_id": "integer",
    "name": "string",
    "description": "string",
    "color": "string",
    "is_primary": "boolean"
  }
]
```

### Events

#### Create a new event

```
POST /calendars/{calendar_id}/events
```

Body:

```json
{
  "title": "string",
  "start_time": "datetime",
  "end_time": "datetime",
  "description": "string",
  "location": "string",
  "attendees": [
    {
      "email": "string"
    }
  ]
}
```

Response: 201 Created

```json
{
  "event_id": "integer",
  "calendar_id": "integer",
  "title": "string",
  "start_time": "datetime",
  "end_time": "datetime",
  "description": "string",
  "location": "string",
  "google_event_id": "string",
  "status": "string",
  "last_synced": "datetime",
  "attendees": [
    {
      "attendee_id": "integer",
      "email": "string",
      "response_status": "string"
    }
  ]
}
```

#### Get events for a calendar

```
GET /calendars/{calendar_id}/events
```

Query Parameters:

- `start_date`: Filter events starting from this date (ISO 8601 format)
- `end_date`: Filter events up to this date (ISO 8601 format)

Response: 200 OK

```json
[
  {
    "event_id": "integer",
    "title": "string",
    "start_time": "datetime",
    "end_time": "datetime",
    "description": "string",
    "location": "string",
    "status": "string"
  }
]
```

### Google Calendar Sync

#### Initiate Google Calendar sync

```
POST /users/{user_id}/sync
```

Response: 202 Accepted

```json
{
  "sync_job_id": "string",
  "status": "string",
  "message": "string"
}
```

#### Get sync status

```
GET /users/{user_id}/sync/{sync_job_id}
```

Response: 200 OK

```json
{
  "sync_job_id": "string",
  "status": "string",
  "start_time": "datetime",
  "end_time": "datetime",
  "events_synced": "integer",
  "errors": [
    {
      "error_message": "string",
      "event_id": "string"
    }
  ]
}
```

### Error Responses

All endpoints can return the following error responses:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Authenticated user doesn't have permission for the requested resource
- `404 Not Found`: Requested resource doesn't exist
- `500 Internal Server Error`: Unexpected server error

Error response body:

```json
{
  "error": "string",
  "message": "string",
  "details": "object (optional)"
}
```
