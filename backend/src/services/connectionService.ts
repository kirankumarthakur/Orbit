import {
  CALENDAR_CONNECTION_ID,
  CALENDAR_CONNECTION_NAME,
  MEET_CONNECTION_ID,
  MEET_CONNECTION_NAME,
  descopeClient,
} from "../config/descope/index.js";
import {
  getAllConnectionsFromDB,
  upsertConnectionInDB,
} from "../repositories/connection.repository.js";

const getAppId = (provider: "calendar" | "meet") => {
  if (provider === "calendar") {
    if (!CALENDAR_CONNECTION_ID) {
      throw new Error("Calendar connection ID is not set in environment variables");
    }
    return CALENDAR_CONNECTION_ID;
  }
  if (!MEET_CONNECTION_ID) {
    throw new Error("Meet connection ID is not set in environment variables");
  }
  return MEET_CONNECTION_ID;
};

const getProviderName = (provider: "calendar" | "meet") => {
  return provider === "calendar" ? CALENDAR_CONNECTION_NAME : MEET_CONNECTION_NAME;
};

const reconcilePendingConnections = async (
  userId: string,
  authUserId: string,
  statusMap: Map<string, string>,
): Promise<void> => {
  if (!process.env.DESCOPE_MANAGEMENT_KEY) {
    return;
  }

  const providers: Array<"calendar" | "meet"> = ["calendar", "meet"];
  for (const provider of providers) {
    if (statusMap.get(provider) === "pending") {
      try {
        const appId = getAppId(provider);
        const response = await descopeClient.management.outboundApplication.fetchToken(
          appId,
          authUserId,
        );
        if (response.ok && response.data) {
          await upsertConnectionInDB(userId, provider, "connected");
          statusMap.set(provider, "connected");
        }
      } catch {}
    }
  }
};

export const getConnections = async (userId: string, authUserId?: string) => {
  try {
    const rows = await getAllConnectionsFromDB(userId);
    const map = new Map(rows.map((r) => [r.provider, r.status]));

    if (authUserId) {
      await reconcilePendingConnections(userId, authUserId, map);
    }

    return {
      calendar: {
        id: "calendar" as const,
        label: CALENDAR_CONNECTION_NAME,
        status: (map.get("calendar") || "disconnected") as "connected" | "disconnected" | "pending",
      },
      meet: {
        id: "meet" as const,
        label: MEET_CONNECTION_NAME,
        status: (map.get("meet") || "disconnected") as "connected" | "disconnected" | "pending",
      },
    };
  } catch (error) {
    console.error("Error fetching connections:", error);
    throw new Error("Failed to fetch connections");
  }
};

export const createProviderConnection = async (
  userId: string,
  provider: "calendar" | "meet",
  refreshToken: string,
  redirectUrl: string,
) => {
  try {
    const appId = getAppId(provider);
    const response = await descopeClient.outbound.connect(
      appId,
      { redirectUrl },
      refreshToken,
    );
    if (!response.ok || !response.data?.url) {
      throw new Error(`Failed to create ${provider} connection`);
    }

    await upsertConnectionInDB(userId, provider, "pending");
    return response.data;
  } catch (error) {
    console.error(`Error creating ${provider} connection:`, error);
    throw new Error(`Failed to create ${provider} connection`);
  }
};

export const refreshProviderConnection = async (
  userId: string,
  authUserId: string,
  provider: "calendar" | "meet",
) => {
  try {
    if (!process.env.DESCOPE_MANAGEMENT_KEY) {
      throw new Error("Descope management key is not set in environment variables");
    }

    const appId = getAppId(provider);
    const response = await descopeClient.management.outboundApplication.fetchToken(
      appId,
      authUserId,
    );

    const status = response.ok && response.data ? "connected" : "disconnected";
    const row = await upsertConnectionInDB(userId, provider, status);

    return {
      id: provider,
      label: getProviderName(provider),
      status: (row?.status || "disconnected") as "connected" | "disconnected" | "pending",
    };
  } catch (error) {
    console.error(`Error refreshing ${provider} connection:`, error);
    throw new Error(`Failed to refresh ${provider} connection`);
  }
};
