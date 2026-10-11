import DescopeClient from "@descope/node-sdk";

const projectId = process.env.DESCOPE_PROJECT_ID ?? "";
const managementKey = process.env.DESCOPE_MANAGEMENT_KEY ?? "";
if (!projectId) {
  throw new Error("DESCOPE_PROJECT_ID environment variable is not set");
}
if (!managementKey) {
  throw new Error("DESCOPE_MANAGEMENT_KEY environment variable is not set");
}

export const descopeClient = DescopeClient({
  projectId: projectId,
  managementKey: managementKey,
});

export const CALENDAR_CONNECTION_ID =
  process.env.DESCOPE_CALENDAR_ID ?? "google-calendar";

export const CALENDAR_CONNECTION_NAME = "Google Calendar";

export const MEET_CONNECTION_ID =
  process.env.DESCOPE_MEET_ID ?? "google-meet";

export const MEET_CONNECTION_NAME = "Google Meet";
