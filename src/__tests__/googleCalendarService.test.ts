import { GoogleCalendarService } from "../googleCalendarService";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

jest.mock("google-auth-library");
jest.mock("googleapis");

describe("GoogleCalendarService", () => {
  let service: GoogleCalendarService;
  let mockOAuth2Client: jest.Mocked<OAuth2Client>;
  let mockCalendar: jest.Mocked<any>;

  beforeEach(() => {
    mockOAuth2Client = new OAuth2Client() as jest.Mocked<OAuth2Client>;
    mockCalendar = {
      events: {
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        list: jest.fn(),
        get: jest.fn(),
      },
    };
    jest.spyOn(google, "calendar").mockReturnValue(mockCalendar);
    service = new GoogleCalendarService(mockOAuth2Client);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addEvent", () => {
    it("should successfully add an event", async () => {
      const mockEvent = { summary: "Test Event" };
      const mockResponse = { data: { id: "123", summary: "Test Event" } };
      mockCalendar.events.insert.mockResolvedValueOnce(mockResponse);

      const result = await service.addEvent("primary", mockEvent);

      expect(mockCalendar.events.insert).toHaveBeenCalledWith({
        calendarId: "primary",
        requestBody: mockEvent,
        sendUpdates: "all",
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw CalendarApiError on failure", async () => {
      mockCalendar.events.insert.mockRejectedValueOnce(new Error("API Error"));

      await expect(service.addEvent("primary", {})).rejects.toThrow(
        "Failed to add event"
      );
    });
  });

  describe("updateEvent", () => {
    it("should successfully update an event", async () => {
      const mockEvent = { summary: "Updated Event" };
      const mockResponse = { data: { id: "123", summary: "Updated Event" } };
      mockCalendar.events.update.mockResolvedValue(mockResponse);

      const result = await service.updateEvent("primary", "123", mockEvent);

      expect(mockCalendar.events.update).toHaveBeenCalledWith({
        calendarId: "primary",
        eventId: "123",
        requestBody: mockEvent,
        sendUpdates: "all",
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw CalendarApiError on failure", async () => {
      mockCalendar.events.update.mockRejectedValue(new Error("API Error"));

      await expect(service.updateEvent("primary", "123", {})).rejects.toThrow(
        "Failed to update event"
      );
    });
  });

  describe("deleteEvent", () => {
    it("should successfully delete an event", async () => {
      mockCalendar.events.delete.mockResolvedValue({});

      await service.deleteEvent("primary", "123");

      expect(mockCalendar.events.delete).toHaveBeenCalledWith({
        calendarId: "primary",
        eventId: "123",
      });
    });

    it("should throw CalendarApiError on failure", async () => {
      mockCalendar.events.delete.mockRejectedValue(new Error("API Error"));

      await expect(service.deleteEvent("primary", "123")).rejects.toThrow(
        "Failed to delete event"
      );
    });
  });

  describe("listEvents", () => {
    it("should successfully list events", async () => {
      const mockResponse = {
        data: { items: [{ id: "123", summary: "Test Event" }] },
      };
      mockCalendar.events.list.mockResolvedValue(mockResponse);

      const result = await service.listEvents(
        "primary",
        "2023-01-01T00:00:00Z",
        "2023-01-31T23:59:59Z"
      );

      expect(mockCalendar.events.list).toHaveBeenCalledWith({
        calendarId: "primary",
        timeMin: "2023-01-01T00:00:00Z",
        timeMax: "2023-01-31T23:59:59Z",
        pageToken: undefined,
        maxResults: 100,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw CalendarApiError on failure", async () => {
      mockCalendar.events.list.mockRejectedValue(new Error("API Error"));

      await expect(
        service.listEvents(
          "primary",
          "2023-01-01T00:00:00Z",
          "2023-01-31T23:59:59Z"
        )
      ).rejects.toThrow("Failed to list events");
    });
  });

  describe("getEvent", () => {
    it("should successfully get an event", async () => {
      const mockResponse = { data: { id: "123", summary: "Test Event" } };
      mockCalendar.events.get.mockResolvedValue(mockResponse);

      const result = await service.getEvent("primary", "123");

      expect(mockCalendar.events.get).toHaveBeenCalledWith({
        calendarId: "primary",
        eventId: "123",
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw CalendarApiError on failure", async () => {
      mockCalendar.events.get.mockRejectedValue(new Error("API Error"));

      await expect(service.getEvent("primary", "123")).rejects.toThrow(
        "Failed to get event"
      );
    });
  });
});
