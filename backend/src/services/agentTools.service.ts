import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import {
  createEvent,
  deleteEvent,
  getCalendarBusy,
  listUpcomingEvents,
  updateEvent,
} from './calendar.service.js';
import { createMeetSpace } from './meet.service.js';

export const createCalendarTool = (authUserId: string) => {
  return {
    listUpcomingEvents: createTool({
      id: 'listUpcomingEvents',
      description:
        'List upcoming Google Calendar events for the user. Set todayOnly to true to fetch only events for today.',
      inputSchema: z.object({
        maxResults: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe('Maximum number of events to return, default is 10'),
        todayOnly: z
          .boolean()
          .optional()
          .describe('Set to true to return only events occurring today'),
      }),
      execute: async (input) => {
        return await listUpcomingEvents(
          authUserId,
          input.maxResults,
          input.todayOnly,
        );
      },
    }),

    getCalendarBusy: createTool({
      id: 'getCalendarBusy',
      description:
        'Query the user Google Calendar for busy periods within a specific start and end time window.',
      inputSchema: z.object({
        startIso: z
          .string()
          .describe('Start of the time window in ISO 8601 format'),
        endIso: z
          .string()
          .describe('End of the time window in ISO 8601 format'),
      }),
      execute: async (input) => {
        return await getCalendarBusy(authUserId, input.startIso, input.endIso);
      },
    }),

    createCalendarEvent: createTool({
      id: 'createCalendarEvent',
      description:
        'Create a new Google Calendar event with title, start and end times, optional attendees, description, and Google Meet video conferencing.',
      inputSchema: z.object({
        title: z.string().min(1).describe('Title or summary of the event'),
        startIso: z
          .string()
          .describe('Start time in ISO 8601 format with timezone offset or UTC'),
        endIso: z
          .string()
          .describe('End time in ISO 8601 format with timezone offset or UTC'),
        attendeeEmails: z
          .array(z.string().email())
          .optional()
          .describe('List of attendee email addresses to invite'),
        description: z
          .string()
          .optional()
          .describe('Detailed agenda or description of the event'),
        addGoogleMeet: z
          .boolean()
          .optional()
          .describe('Whether to attach a Google Meet link, defaults to true'),
      }),
      execute: async (input) => {
        return await createEvent(
          authUserId,
          input.title,
          input.startIso,
          input.endIso,
          input.attendeeEmails,
          input.description,
          input.addGoogleMeet,
        );
      },
    }),

    updateCalendarEvent: createTool({
      id: 'updateCalendarEvent',
      description:
        'Update or reschedule an existing Google Calendar event with new start and end times.',
      inputSchema: z.object({
        eventId: z
          .string()
          .min(1)
          .describe('Unique Google Calendar event ID to update'),
        startIso: z
          .string()
          .describe('New start time in ISO 8601 format'),
        endIso: z
          .string()
          .describe('New end time in ISO 8601 format'),
      }),
      execute: async (input) => {
        return await updateEvent(
          authUserId,
          input.eventId,
          input.startIso,
          input.endIso,
        );
      },
    }),

    deleteCalendarEvent: createTool({
      id: 'deleteCalendarEvent',
      description:
        'Delete or cancel an existing Google Calendar event by its event ID.',
      inputSchema: z.object({
        eventId: z
          .string()
          .min(1)
          .describe('Unique Google Calendar event ID to delete'),
      }),
      execute: async (input) => {
        return await deleteEvent(authUserId, input.eventId);
      },
    }),

    createGoogleMeetSpace: createTool({
      id: 'createGoogleMeetSpace',
      description:
        'Generate an instant Google Meet meeting space and video call link immediately without creating a calendar entry.',
      inputSchema: z.object({}),
      execute: async () => {
        return await createMeetSpace(authUserId);
      },
    }),
  };
};
