# Calendar Microservice (Google Calendar Integration) API Documentation

## Base URL

- Development: `http://localhost:3000`

## Authentication

- OAuth2 with Google
- The user will authenticate via Google OAuth2 to access their Google Calendar.
- OAuth2 tokens should be passed in the Authorization header as a Bearer token.

## Login (OAuth2)

- URL: `/auth/google`
- Method: GET
- Description: Redirects the user to the Google OAuth2 consent screen to log in.
- Response:
  - Success (302 Redirect): User is redirected to the Google login page.
  - Failure (400): Error in the OAuth2 flow.

## Callback URL (OAuth2)

- URL: `/auth/google/callback`
- Method: GET
- Description: Handles the callback after successful Google OAuth2 login.
- Response:
  - Success (200): OAuth2 token is returned and user is authenticated.
  - Failure (400): Error in the callback flow.

## API Endpoints

1. Create a New Event

- URL: `/events`
- Method: POST
- Description: Create a new event in the user's Google Calendar and local database.
- Request Parameters:
  - Body (JSON):
    ```json
    {
      "title": "Meeting with Team",
      "description": "Discuss project updates",
      "start_time": "2024-09-16T10:00:00Z",
      "end_time": "2024-09-16T11:00:00Z",
      "location": "Zoom",
      "category": "Work",
      "is_recurring": false
    }
    ```
- Response:
  - Success (201):
    ```json
    {
      "message": "Event created successfully",
      "event_id": "abc123",
      "google_event_id": "gcal123",
      "sync_status": "success"
    }
    ```
  - Failure (400):
    ```json
    {
      "error": "Invalid request data"
    }
    ```

2. Retrieve Events

- URL: `/events`
- Method: GET
- Description: Retrieve all events for a user based on query filters.
- Query Parameters:
  - Optional:
    - `start_date` (YYYY-MM-DD)
    - `end_date` (YYYY-MM-DD)
    - `category` (e.g., "Work", "Personal")
- Response:
  - Success (200):
    ```json
    [
      {
        "event_id": "abc123",
        "title": "Meeting with Team",
        "description": "Discuss project updates",
        "start_time": "2024-09-16T10:00:00Z",
        "end_time": "2024-09-16T11:00:00Z",
        "location": "Zoom",
        "category": "Work"
      },
      {
        "event_id": "def456",
        "title": "Lunch with Client",
        "description": "Discuss contract",
        "start_time": "2024-09-17T12:00:00Z",
        "end_time": "2024-09-17T13:00:00Z",
        "location": "Restaurant",
        "category": "Work"
      }
    ]
    ```
  - Failure (400):
    ```json
    {
      "error": "Invalid query parameters"
    }
    ```

3. Update an Event

- URL: `/events/:id`
- Method: PUT
- Description: Update an existing event in Google Calendar and the local database.
- Request Parameters:
  - URL Parameter:
    - `id` (string): The event ID.
  - Body (JSON):
    ```json
    {
      "title": "Updated Meeting Title",
      "description": "Updated project discussion",
      "start_time": "2024-09-16T11:00:00Z",
      "end_time": "2024-09-16T12:00:00Z",
      "location": "Microsoft Teams"
    }
    ```
- Response:
  - Success (200):
    ```json
    {
      "message": "Event updated successfully",
      "event_id": "abc123",
      "google_event_id": "gcal123",
      "sync_status": "success"
    }
    ```
  - Failure (404):
    ```json
    {
      "error": "Event not found"
    }
    ```

4. Delete an Event

- URL: `/events/:id`
- Method: DELETE
- Description: Delete an event from Google Calendar and the local database.
- Request Parameters:
  - URL Parameter:
    - `id` (string): The event ID.
- Response:
  - Success (200):
    ```json
    {
      "message": "Event deleted successfully"
    }
    ```
  - Failure (404):
    ```json
    {
      "error": "Event not found"
    }
    ```

5. Sync with Google Calendar

- URL: `/sync`
- Method: POST
- Description: Manually trigger a sync between local events and Google Calendar.
- Response:
  - Success (200):
    ```json
    {
      "message": "Sync initiated successfully",
      "sync_status": "in_progress"
    }
    ```
  - Failure (500):
    ```json
    {
      "error": "Failed to sync with Google Calendar"
    }
    ```

6. Get Sync Logs

- URL: `/sync/logs`
- Method: GET
- Description: Retrieve sync logs for auditing purposes.
- Query Parameters:
  - `user_id` (optional): Fetch logs for a specific user.
- Response:
  - Success (200):
    ```json
    [
      {
        "log_id": "log123",
        "event_id": "abc123",
        "sync_status": "success",
        "sync_time": "2024-09-16T12:00:00Z"
      },
      {
        "log_id": "log124",
        "event_id": "def456",
        "sync_status": "failed",
        "sync_time": "2024-09-17T14:00:00Z"
      }
    ]
    ```
  - Failure (500):
    ```json
    {
      "error": "Failed to retrieve sync logs"
    }
    ```

## Error Codes

| Code | Message               | Description                              |
| ---- | --------------------- | ---------------------------------------- |
| 200  | OK                    | Request succeeded.                       |
| 201  | Created               | Resource created successfully.           |
| 400  | Bad Request           | Invalid input or missing parameters.     |
| 401  | Unauthorized          | Invalid or missing authentication token. |
| 404  | Not Found             | Requested resource not found.            |
| 500  | Internal Server Error | Unexpected server error.                 |

## Security

- OAuth2 (Google)
  - Users authenticate using Google OAuth2.
  - After login, an access token will be provided and must be included in the `Authorization: Bearer <token>` header for all subsequent requests.
- RBAC (Role-Based Access Control)
  - Only authenticated users can create, update, or delete events.
  - Admins have access to all user events and sync logs.

## Rate Limiting

- Standard Users: Limited to 100 API calls per minute.
- Admin Users: Limited to 500 API calls per minute.

## Throttling and Retry

- In case of Google API failures (due to rate limits, etc.), the microservice will use an exponential backoff strategy to retry failed requests.

## Notifications

- Email notifications will be sent for upcoming events and changes to event details.
- Users can configure the lead time for reminders (e.g., 15 minutes, 30 minutes).
