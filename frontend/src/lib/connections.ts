import { getRefreshToken } from "@descope/nextjs-sdk/client";
import { apiCall } from "./services/api";
import type { AllConnections, ConnectionItem } from "./types";

export const fetchAllConnections = async (
  token: string,
): Promise<AllConnections> => {
  const response = await apiCall<{
    success: boolean;
    connections: AllConnections;
  }>("/connections", {
    token,
  });

  return response.connections;
};

export const fetchConnections = fetchAllConnections;

export const connectProvider = async (
  token: string,
  provider: "calendar" | "meet",
) => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error(
      "Refresh token is missing. Please provide a valid refresh token.",
    );
  }

  const response = await apiCall<{
    success: boolean;
    connection: { url: string };
  }>("/connections/connect", {
    method: "POST",
    token,
    body: {
      provider,
      redirectUrl: `${window.location.origin}/dashboard?view=connections`,
      refreshToken,
    },
  });

  window.location.href = response.connection.url;
};

export const refreshProvider = async (
  token: string,
  provider: "calendar" | "meet",
): Promise<ConnectionItem> => {
  const response = await apiCall<{
    success: boolean;
    connection: ConnectionItem;
  }>("/connections/refresh", {
    method: "POST",
    token,
    body: { provider },
  });

  return response.connection;
};
