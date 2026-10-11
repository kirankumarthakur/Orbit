import {
  CALENDAR_CONNECTION_ID,
  MEET_CONNECTION_ID,
  descopeClient,
} from "../config/descope/index.js";

export const getCalendarAccessToken = async (
  authUserId: string,
): Promise<string> => {
  try {
    if (!CALENDAR_CONNECTION_ID || !process.env.DESCOPE_MANAGEMENT_KEY) {
      throw new Error("Missing required environment variables for Descope");
    }

    const response =
      await descopeClient.management.outboundApplication.fetchToken(
        CALENDAR_CONNECTION_ID,
        authUserId,
      );

    if (!response.ok || !response.data) {
      throw new Error(`Failed to fetch calendar access token`);
    }

    const accessToken = response.data.accessToken;

    if (!accessToken) {
      throw new Error(`Access token not found`);
    }
    return accessToken;
  } catch (error) {
    console.error("Error fetching calendar access token:", error);
    throw error;
  }
};

export const getMeetAccessToken = async (
  authUserId: string,
): Promise<string> => {
  try {
    if (!MEET_CONNECTION_ID || !process.env.DESCOPE_MANAGEMENT_KEY) {
      return await getCalendarAccessToken(authUserId);
    }

    const response =
      await descopeClient.management.outboundApplication.fetchToken(
        MEET_CONNECTION_ID,
        authUserId,
      );

    if (response.ok && response.data?.accessToken) {
      return response.data.accessToken;
    }

    return await getCalendarAccessToken(authUserId);
  } catch {
    return await getCalendarAccessToken(authUserId);
  }
};
