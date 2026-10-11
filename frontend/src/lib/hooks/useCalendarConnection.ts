"use client";

import {
  connectCalendar,
  fetchConnections,
  refreshCalendarConnection,
} from "@/lib/connections";
import type { ConnectionInfo } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

export const useCalendarConnection = (sessionToken: string | null) => {
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionToken));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sessionToken) return;
    setLoading(true);
    setError(null);
    try {
      setConnection(await fetchConnections(sessionToken));
    } catch (cause) {
      console.error("Error fetching calendar connection:", cause);
      setError("Could not load calendar status.");
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  const connect = useCallback(async () => {
    if (!sessionToken) return;
    setLoading(true);
    setError(null);
    try {
      await connectCalendar(sessionToken);
    } catch (cause) {
      console.error("Error connecting to calendar:", cause);
      setError("Could not start calendar connect.");
      setLoading(false);
    }
  }, [sessionToken]);

  const refresh = useCallback(async () => {
    if (!sessionToken) return;
    setLoading(true);
    setError(null);
    try {
      await refreshCalendarConnection(sessionToken);
      setConnection(await fetchConnections(sessionToken));
    } catch (cause) {
      console.error("Error refreshing calendar connection:", cause);
      setError("Could not refresh calendar.");
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    void load();
  }, [load]);

  return { connection, loading, error, load, connect, refresh };
};
