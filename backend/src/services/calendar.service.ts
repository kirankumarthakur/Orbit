import { randomUUID } from "crypto";
import { calendar_v3, google } from "googleapis";
import { getCalendarAccessToken } from "./token.service.js";

const calendarClient = (token: string) => {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });
    return google.calendar({ version: "v3", auth });
  } catch (error) {
    console.error("Error creating Google Calendar client:", error);
  }
};

const createUserCalendar = async (authUserId: string) => {
  try {
    const accessToken = await getCalendarAccessToken(authUserId);
    return calendarClient(accessToken);
  } catch (error) {
    console.error("Error creating user calendar:", error);
  }
};

const formatEvent = (event: calendar_v3.Schema$Event) => {
  return {
    id: event.id,
    title: event.summary ?? "[No Title]",
    description: event.description?.trim() ?? "",
    location: event.location?.trim() ?? null,
    start: event.start?.dateTime ?? event.start?.date ?? null,
    end: event.end?.dateTime ?? event.end?.date ?? null,
    htmlLink: event.htmlLink ?? null,
    meetLink: event.hangoutLink ?? null,
    attendees: (event.attendees ?? [])
      .map((person) => person.email || person.displayName)
      .filter((value): value is string => value !== null),
  };
};

export const listUpcomingEvents = async (
  authUserId: string,
  maxResults?: number,
  todayOnly?: boolean,
) => {
  try {
    const calendar = await createUserCalendar(authUserId);
    if (!calendar) {
      throw new Error("Failed to create calendar client");
    }
    let timeMin = new Date().toISOString();
    let timeMax: string | undefined = undefined;
    if (todayOnly) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      timeMin = startOfDay.toISOString();
      timeMax = endOfDay.toISOString();
    }

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin,
      timeMax,
      maxResults: maxResults || 10,
      singleEvents: true,
      orderBy: "startTime",
    });
    return (response.data.items ?? []).map(formatEvent);
  } catch (error) {
    console.error("Error listing upcoming events:", error);
    throw error;
  }
};

export const createEvent = async (
  authUserId: string,
  title: string,
  startIso: string,
  endIso: string,
  attendeeEmails?: string[],
  description?: string,
  addGoogleMeet?: boolean,
) => {
  try {
    const calendar = await createUserCalendar(authUserId);
    if (!calendar) {
      throw new Error("Failed to create calendar client");
    }
    const withMeet = addGoogleMeet !== false;
    const response = await calendar.events.insert({
      calendarId: "primary",
      sendUpdates: "all",
      conferenceDataVersion: withMeet ? 1 : undefined,
      requestBody: {
        summary: title,
        description: description,
        start: {
          dateTime: startIso,
        },
        end: {
          dateTime: endIso,
        },
        attendees: attendeeEmails?.map((email) => ({ email })) ?? [],
        conferenceData: withMeet
          ? {
              createRequest: {
                requestId: randomUUID(),
                conferenceSolutionKey: {
                  type: "hangoutsMeet",
                },
              },
            }
          : undefined,
      },
    });
    return {
      ...formatEvent(response.data),
      inviteEmailsSent: (attendeeEmails?.length ?? 0) > 0,
      googleMeetAdded: withMeet,
    };
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export const deleteEvent = async (authUserId: string, eventId: string) => {
  try {
    const calendar = await createUserCalendar(authUserId);
    if (!calendar) {
      throw new Error("Failed to create calendar client");
    }
    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });
    return {
      success: true,
      message: "Event deleted successfully",
      cancelled: true,
      eventId: eventId,
    };
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

export const updateEvent = async (
  authUserId: string,
  eventId: string,
  startIso: string,
  endIso: string,
) => {
  try {
    const calendar = await createUserCalendar(authUserId);
    if (!calendar) {
      throw new Error("Failed to create calendar client");
    }
    const response = await calendar.events.patch({
      calendarId: "primary",
      eventId: eventId,
      requestBody: {
        start: {
          dateTime: startIso,
        },
        end: {
          dateTime: endIso,
        },
      },
    });
    return formatEvent(response.data);
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

export const getCalendarBusy = async (
  authUserId: string,
  startIso: string,
  endIso: string,
) => {
  try {
    const calendar = await createUserCalendar(authUserId);
    if (!calendar) {
      throw new Error("Failed to create calendar client");
    }
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startIso,
        timeMax: endIso,
        items: [
          {
            id: "primary",
          },
        ],
      },
    });
    const busy = response.data?.calendars?.primary?.busy ?? [];
    return {
      busy: busy.map((period) => ({
        start: period.start ?? null,
        end: period.end ?? null,
      })),
    };
  } catch (error) {
    console.error("Error getting calendar busy times:", error);
    throw error;
  }
};
