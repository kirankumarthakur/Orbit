import { google } from "googleapis";
import { getMeetAccessToken } from "./token.service.js";

export type MeetSpaceResponse = {
  name: string;
  meetingUri: string;
  meetingCode: string;
};

export const createMeetSpace = async (
  authUserId: string,
): Promise<MeetSpaceResponse> => {
  try {
    const token = await getMeetAccessToken(authUserId);
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });
    const meet = google.meet({ version: "v2", auth });

    const response = await meet.spaces.create({
      requestBody: {
        config: {
          accessType: "OPEN",
        },
      },
    });

    return {
      name: response.data.name ?? "",
      meetingUri: response.data.meetingUri ?? "",
      meetingCode: response.data.meetingCode ?? "",
    };
  } catch (error) {
    console.error("Error creating Google Meet space:", error);
    throw error;
  }
};
