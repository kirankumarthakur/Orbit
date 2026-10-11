"use client";

import { AllConnections, ConnectionItem } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "../ui/skeleton";
import {
  connectProvider,
  fetchAllConnections,
  refreshProvider,
} from "@/lib/connections";
import SmoothButton from "../smoothui/smooth-button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  PanelLeft,
  Plus,
  RefreshCw,
  Video,
  XCircle,
} from "lucide-react";

interface ConnectionsPanelProps {
  sessionToken: string;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const ConnectionsPanel = ({
  sessionToken,
  isSidebarOpen,
  onToggleSidebar,
}: ConnectionsPanelProps) => {
  const [connections, setConnections] = useState<AllConnections | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<"calendar" | "meet" | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const getConnectionsData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllConnections(sessionToken);
      setConnections(data);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  const handleConnect = async (provider: "calendar" | "meet") => {
    setActionLoading(provider);
    try {
      await connectProvider(sessionToken, provider);
      await handleRefreshConnection(provider);
      setAddDialogOpen(false);
    } catch (error) {
      console.error("Error connecting provider:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefreshConnection = async (provider: "calendar" | "meet") => {
    setActionLoading(provider);
    try {
      const updated = await refreshProvider(sessionToken, provider);
      setConnections((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [provider]: updated,
        };
      });
      await getConnectionsData();
    } catch (error) {
      console.error("Error refreshing connection:", error);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    getConnectionsData();
  }, [getConnectionsData]);

  const calendarConnected = connections?.calendar?.status === "connected";
  const meetConnected = connections?.meet?.status === "connected";
  const connectedCount = (calendarConnected ? 1 : 0) + (meetConnected ? 1 : 0);

  const renderStatusBadge = (item?: ConnectionItem) => {
    if (item?.status === "connected") {
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1.5 rounded-full border border-lime/30 bg-lime/10 px-2.5 py-0.5 text-[11px] text-lime"
        >
          <CheckCircle2 className="size-3" />
          <span>Connected</span>
        </Badge>
      );
    }
    if (item?.status === "pending") {
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1.5 rounded-full border border-orange/30 bg-orange/10 px-2.5 py-0.5 text-[11px] text-orange"
        >
          <Clock className="size-3" />
          <span>Pending</span>
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-white/50"
      >
        <XCircle className="size-3" />
        <span>Disconnected</span>
      </Badge>
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-black text-white">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/15 px-4 md:px-8">
        <div className="flex items-center gap-2">
          {!isSidebarOpen && onToggleSidebar && (
            <motion.button
              type="button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onToggleSidebar}
              className="flex size-8 items-center justify-center rounded-lg border border-white/20 bg-white/[0.05] text-white/80 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
              title="Open sidebar"
            >
              <PanelLeft className="size-4" />
            </motion.button>
          )}
          <span className="font-medium text-xs text-white/80">
            Connections
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="flex items-center justify-between pb-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-wide text-white">
                  Connections
                </h2>
                <Badge
                  variant="secondary"
                  className="rounded-full border border-white/20 bg-white/[0.08] px-2.5 py-0.5 text-[10px] text-white/80"
                >
                  {`${connectedCount} / 2 Connected`}
                </Badge>
              </div>
              <p className="text-xs text-white/70">
                Manage your Google Calendar and Google Meet integrations for Orbit AI scheduling.
              </p>
            </div>

            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger
                render={
                  <SmoothButton
                    variant="outline"
                    color="neutral"
                    size="sm"
                    prefix={<Plus className="size-3.5 text-periwinkle" />}
                    className="rounded-xl border border-white/20 bg-white/[0.05] text-xs text-white hover:border-white/35 hover:bg-white/10"
                  >
                    Add Connection
                  </SmoothButton>
                }
              />
              <DialogContent className="rounded-2xl border border-white/20 bg-zinc-950 text-white sm:max-w-md shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white text-base font-semibold">
                    Add Connection
                  </DialogTitle>
                  <DialogDescription className="text-white/70 text-xs">
                    Choose a provider to connect with Orbit.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 py-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between rounded-xl border border-white/20 bg-white/[0.05] p-4 transition-all hover:border-white/40 hover:bg-white/[0.08]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl border border-periwinkle/40 bg-periwinkle/15 text-periwinkle">
                        <Calendar className="size-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white">
                          Google Calendar
                        </span>
                        <span className="text-[10px] text-white/60">
                          Events, busy checks & scheduling
                        </span>
                      </div>
                    </div>

                    <SmoothButton
                      size="xs"
                      variant="solid"
                      color="accent"
                      loading={actionLoading === "calendar"}
                      onClick={() => handleConnect("calendar")}
                      className="rounded-lg bg-periwinkle text-black hover:bg-periwinkle/90"
                    >
                      {calendarConnected ? "Reconnect" : "Connect"}
                    </SmoothButton>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between rounded-xl border border-white/20 bg-white/[0.05] p-4 transition-all hover:border-white/40 hover:bg-white/[0.08]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl border border-blue-400/40 bg-blue-500/15 text-blue-400">
                        <Video className="size-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white">
                          Google Meet
                        </span>
                        <span className="text-[10px] text-white/60">
                          Video conferencing & meeting spaces
                        </span>
                      </div>
                    </div>

                    <SmoothButton
                      size="xs"
                      variant="solid"
                      color="accent"
                      loading={actionLoading === "meet"}
                      onClick={() => handleConnect("meet")}
                      className="rounded-lg bg-periwinkle text-black hover:bg-periwinkle/90"
                    >
                      {meetConnected ? "Reconnect" : "Connect"}
                    </SmoothButton>
                  </motion.div>
                </div>

                <DialogFooter showCloseButton />
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card className="rounded-2xl border border-white/20 bg-zinc-950/80 p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="size-10 rounded-xl" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-32 rounded-md" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
              </Card>
              <Card className="rounded-2xl border border-white/20 bg-zinc-950/80 p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="size-10 rounded-xl" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-32 rounded-md" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className="flex flex-col justify-between rounded-2xl border border-white/20 bg-zinc-950/80 p-5 transition-colors hover:border-white/35 shadow-md"
              >
                <div>
                  <CardHeader className="flex flex-row items-start justify-between p-0 pb-3">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-periwinkle/40 bg-periwinkle/15 text-periwinkle">
                      <Calendar className="size-5" />
                    </div>
                    {renderStatusBadge(connections?.calendar)}
                  </CardHeader>

                  <CardTitle className="text-sm font-semibold text-white tracking-normal normal-case">
                    Google Calendar
                  </CardTitle>
                  <p className="mt-1 text-xs text-white/70">
                    Sync calendar schedule, find free slots, and manage upcoming meetings.
                  </p>
                </div>

                <CardFooter className="flex flex-wrap items-center gap-2 p-0 pt-4">
                  {!calendarConnected ? (
                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <SmoothButton
                        variant="solid"
                        color="accent"
                        size="sm"
                        loading={actionLoading === "calendar"}
                        onClick={() => handleConnect("calendar")}
                        prefix={<ExternalLink className="size-3.5" />}
                        className="w-full rounded-xl bg-periwinkle text-xs font-medium text-black hover:bg-periwinkle/90"
                      >
                        Connect
                      </SmoothButton>
                    </motion.div>
                  ) : (
                    <>
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <SmoothButton
                          variant="outline"
                          color="neutral"
                          size="sm"
                          disabled={actionLoading === "calendar"}
                          onClick={() => handleRefreshConnection("calendar")}
                          prefix={
                            <RefreshCw
                              className={`size-3.5 ${actionLoading === "calendar" ? "animate-spin" : ""}`}
                            />
                          }
                          className="w-full rounded-xl border border-white/20 bg-white/[0.05] text-xs text-white hover:border-white/30 hover:bg-white/10"
                        >
                          Refresh
                        </SmoothButton>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <SmoothButton
                          variant="ghost"
                          color="neutral"
                          size="sm"
                          disabled={actionLoading === "calendar"}
                          onClick={() => handleConnect("calendar")}
                          className="rounded-xl border border-white/15 text-xs text-white/80 hover:bg-white/[0.08] hover:text-white"
                        >
                          Reconnect
                        </SmoothButton>
                      </motion.div>
                    </>
                  )}
                </CardFooter>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className="flex flex-col justify-between rounded-2xl border border-white/20 bg-zinc-950/80 p-5 transition-colors hover:border-white/35 shadow-md"
              >
                <div>
                  <CardHeader className="flex flex-row items-start justify-between p-0 pb-3">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-blue-400/40 bg-blue-500/15 text-blue-400">
                      <Video className="size-5" />
                    </div>
                    {renderStatusBadge(connections?.meet)}
                  </CardHeader>

                  <CardTitle className="text-sm font-semibold text-white tracking-normal normal-case">
                    Google Meet
                  </CardTitle>
                  <p className="mt-1 text-xs text-white/70">
                    Create instant video conference spaces and attach meeting links to events.
                  </p>
                </div>

                <CardFooter className="flex flex-wrap items-center gap-2 p-0 pt-4">
                  {!meetConnected ? (
                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <SmoothButton
                        variant="solid"
                        color="accent"
                        size="sm"
                        loading={actionLoading === "meet"}
                        onClick={() => handleConnect("meet")}
                        prefix={<ExternalLink className="size-3.5" />}
                        className="w-full rounded-xl bg-periwinkle text-xs font-medium text-black hover:bg-periwinkle/90"
                      >
                        Connect
                      </SmoothButton>
                    </motion.div>
                  ) : (
                    <>
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <SmoothButton
                          variant="outline"
                          color="neutral"
                          size="sm"
                          disabled={actionLoading === "meet"}
                          onClick={() => handleRefreshConnection("meet")}
                          prefix={
                            <RefreshCw
                              className={`size-3.5 ${actionLoading === "meet" ? "animate-spin" : ""}`}
                            />
                          }
                          className="w-full rounded-xl border border-white/20 bg-white/[0.05] text-xs text-white hover:border-white/30 hover:bg-white/10"
                        >
                          Refresh
                        </SmoothButton>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <SmoothButton
                          variant="ghost"
                          color="neutral"
                          size="sm"
                          disabled={actionLoading === "meet"}
                          onClick={() => handleConnect("meet")}
                          className="rounded-xl border border-white/15 text-xs text-white/80 hover:bg-white/[0.08] hover:text-white"
                        >
                          Reconnect
                        </SmoothButton>
                      </motion.div>
                    </>
                  )}
                </CardFooter>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionsPanel;
