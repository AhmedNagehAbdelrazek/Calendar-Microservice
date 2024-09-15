# Calendar Microservice (Google Calendar Integration) Product Requirements Document

**Document Version**
Version: 1.0
Date: September 15, 2024
Author: Mohamed Ezzat

## Overview

The Calendar Microservice is a standalone service responsible for managing and synchronizing calendar events between internal systems and Google Calendar. The service allows users to create, update, delete, and retrieve calendar events while syncing with Google Calendar. Additional features include local event storage, offline access, notifications, reminders, event categorization, and user-specific preferences.

## Goals

- Integrate seamlessly with Google Calendar using Google Calendar API.
- Provide full CRUD (Create, Read, Update, Delete) operations for calendar events.
- Store events locally in a database for offline access and to enable custom features.
- Notify users of upcoming events and event changes via email/push notifications.
- Ensure secure and scalable operations, with role-based access control (RBAC) and encryption for sensitive data.
- Offer a simple, developer-friendly API for managing calendar data.

## Assumptions

- Users are authenticated via OAuth2 (Google) or JWT (internal).
- The service must handle syncing issues gracefully, with retry mechanisms.
- The service must support recurring events and custom notifications.
- The service will scale to handle thousands of users concurrently.

## Non-Goals

- This microservice will not provide a UI; it is meant to serve as a backend service.
- Direct support for non-Google calendar providers (e.g., Outlook) is out of scope for the first version.

## User Stories and Requirements

1. User Authentication with Google OAuth2

- Story: As a user, I want to log in using my Google account to access my calendar data.
- Requirements:
  - Support OAuth2 authentication with Google.
  - Store the access token securely for API interactions.
  - Provide the ability to refresh tokens when they expire.

2. Event Creation

- Story: As a user, I want to create new events on my calendar.
- Requirements:
  - Create events via API and store them in both the local database and Google Calendar.
  - Provide fields: title, description, start_time, end_time, location, and category.
  - Support recurring events (daily, weekly, etc.).
  - Return a success or failure response after creating the event.

3. Event Updates

- Story: As a user, I want to update existing events on my calendar.
- Requirements:
  - Allow users to update event details and sync changes with Google Calendar.
  - Ensure google_event_id is used to track and update events on both sides.

4. Event Deletion

- Story: As a user, I want to delete events from my calendar.
- Requirements:
  - Remove events from both the local database and Google Calendar.
  - Handle cases where an event doesn't exist on Google (sync mismatch).

5. Event Retrieval

- Story: As a user, I want to view events from my calendar for a specific time period.
- Requirements:
  - Fetch events from the local database and Google Calendar.
  - Allow filters by date range, category, or recurrence.

6. Sync with Google Calendar

- Story: As a user, I want my local events to stay in sync with Google Calendar.
- Requirements:
  - Use Google Calendar API to fetch changes from the user’s Google Calendar.
  - Sync new, updated, or deleted events between systems regularly.
  - Handle conflicts gracefully (e.g., if an event is updated locally and on Google simultaneously).

7. Notifications and Reminders

- Story: As a user, I want to be notified about upcoming events.
- Requirements:
  - Send email/push notifications before an event (configurable time in advance).
  - Notify users of changes to events (updates, cancellations).
  - Support different notification types (email, push, etc.).

8. Offline Access and Local Storage

- Story: As a user, I want to view and edit events even when I’m offline.
- Requirements:
  - Store events locally in a database for offline access.
  - Automatically sync events when connectivity is restored.

9. Recurring Events Support

- Story: As a user, I want to create and manage recurring events (e.g., daily, weekly, monthly).
- Requirements:
  - Support standard recurrence rules.
  - Store recurrence data locally to handle offline access.

10. Security and Access Control

- Story: As a user, I want my calendar data to be secure and accessible only to authorized personnel.
- Requirements:
- OAuth2 for external authentication with Google.
- JWT for internal user session management.
- RBAC to restrict access based on user roles (admins, users).
- Encrypt sensitive data (e.g., access tokens) in the database.

## Technical Specifications

11. API Endpoints (For more details: [Click here](./API-Endpoints.md))

| Endpoint     | Method | Description                          | Parameters                                   |
| ------------ | ------ | ------------------------------------ | -------------------------------------------- |
| /auth/google | GET    | Initiates OAuth2 with Google         | N/A                                          |
| /events      | POST   | Creates a new event                  | title, description, start_time, etc.         |
| /events/:id  | PUT    | Updates an existing event            | title, description, start_time, etc.         |
| /events/:id  | DELETE | Deletes an event                     | Event ID                                     |
| /events      | GET    | Retrieves events for a time period   | Query params: start_date, end_date, category |
| /sync        | POST   | Manually triggers a sync with Google | N/A                                          |

12. Database Schema (For the ERD: [Click here](./ERD.png))

**Users Table**

| Column       | Type      |
| ------------ | --------- |
| id           | UUID      |
| email        | VARCHAR   |
| google_token | VARCHAR   |
| created_at   | TIMESTAMP |
| updated_at   | TIMESTAMP |

**Events Table**

| Column          | Type      |
| --------------- | --------- |
| id              | UUID      |
| user_id         | UUID      |
| google_event_id | VARCHAR   |
| title           | VARCHAR   |
| description     | TEXT      |
| start_time      | TIMESTAMP |
| end_time        | TIMESTAMP |
| is_recurring    | BOOLEAN   |
| recurrence_rule | VARCHAR   |
| category        | VARCHAR   |
| created_at      | TIMESTAMP |
| updated_at      | TIMESTAMP |

**Sync Logs Table**

| Column      | Type      |
| ----------- | --------- |
| id          | UUID      |
| user_id     | UUID      |
| event_id    | UUID      |
| sync_status | VARCHAR   |
| sync_time   | TIMESTAMP |

## Technology Stack

- Backend: Node.js with Express.js
- Database: PostgreSQL
- Authentication: Google OAuth2, JWT
- Notification Service: Node-cron, Nodemailer (for emails), Firebase or AWS SNS (for push notifications)
- Google Calendar Integration: Google Calendar API
- Deployment: Docker, AWS ECS or Kubernetes
- Monitoring: Prometheus + Grafana for service monitoring, Winston for logging

## Milestones and Timeline

| Milestone                            | Deadline           |
| ------------------------------------ | ------------------ |
| OAuth2 integration with Google       | September 00, 2024 |
| Event creation, update, and deletion | October 00, 2024   |
| Google Calendar Sync                 | October 00, 2024   |
| Notifications and reminders          | October 00, 2024   |
| Recurring events support             | October 00, 2024   |
| Role-based access control (RBAC)     | October 00, 2024   |
| Offline access implementation        | October 00, 2024   |
| Final Testing & Bug Fixes            | October 00, 2024   |
| Deployment                           | October 00, 2024   |

## Risks and Mitigation

| Risk                            | Mitigation                                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| Google Calendar API rate limits | Implement a retry policy and use Google’s batch API for bulk operations.                       |
| OAuth2 token expiration         | Refresh tokens periodically and handle OAuth2 token refresh failures gracefully.               |
| Sync conflicts between systems  | Implement conflict resolution policies (e.g., last updated wins).                              |
| API downtime or sync failures   | Implement retry policies with exponential backoff for failed API requests.                     |
| Scalability concerns            | Design system to be horizontally scalable using Docker and Kubernetes or AWS ECS.              |
| Data security breaches          | Ensure proper encryption of sensitive data (OAuth2 tokens) and follow security best practices. |
