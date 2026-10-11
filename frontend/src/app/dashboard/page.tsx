"use client";

import { Loader2 } from "lucide-react";
import {
  useDescope,
  useSession,
  useUser,
  getSessionToken,
} from "@descope/nextjs-sdk/client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ChatSidebar, { ChatSession } from "@/components/dashboard/chat-sidebar";
import ChatPanel from "@/components/dashboard/chat";
import ConnectionsPanel from "@/components/dashboard/connectionsPanel";
import { fetchAllConnections } from "@/lib/connections";
import { fetchThreads } from "@/lib/agent";

const getInitialActiveView = (): "chat" | "connections" => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "connections") {
      return "connections";
    }
  }
  return "chat";
};

const DashboardPage = () => {
  const sdk = useDescope();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeView, setActiveView] = useState<"chat" | "connections">(getInitialActiveView);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [meetConnected, setMeetConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  const { isAuthenticated, isSessionLoading, sessionToken: hookToken } = useSession();
  const { user, isUserLoading } = useUser();
  const sessionToken = hookToken || getSessionToken() || "";

  const label = user?.name || "Signed In user";
  const picture = user?.picture;

  const isLoading = isSessionLoading || isUserLoading;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !sessionToken) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, sessionToken, router]);

  const loadThreadsList = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const threadList = await fetchThreads(sessionToken);
      if (threadList && threadList.length > 0) {
        setSessions(
          threadList.map((t) => ({
            id: t.id,
            title: t.title,
            timestamp: t.updatedAt,
          })),
        );
        setActiveSessionId((prev) => {
          if (!prev) return threadList[0].id;
          return prev;
        });
      } else {
        const initialId =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `thread-${Date.now()}`;
        setSessions([{ id: initialId, title: "New Conversation" }]);
        setActiveSessionId((prev) => prev || initialId);
      }
    } catch {
      const fallbackId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `thread-${Date.now()}`;
      setSessions([{ id: fallbackId, title: "New Conversation" }]);
      setActiveSessionId((prev) => prev || fallbackId);
    }
  }, [sessionToken]);

  const syncConnectionStates = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const conns = await fetchAllConnections(sessionToken);
      setCalendarConnected(conns?.calendar?.status === "connected");
      setMeetConnected(conns?.meet?.status === "connected");
    } catch {}
  }, [sessionToken]);

  useEffect(() => {
    loadThreadsList();
  }, [loadThreadsList]);

  useEffect(() => {
    syncConnectionStates();
  }, [syncConnectionStates]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      await sdk.logout();
      router.replace("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const handleNewChat = () => {
    const newId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `thread-${Date.now()}`;
    setActiveSessionId(newId);
    setActiveView("chat");
    setSessions((prev) => [
      { id: newId, title: "New Conversation" },
      ...prev.filter((s) => s.id !== newId),
    ]);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <Loader2 className="size-8 animate-spin text-periwinkle" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white">
      <ChatSidebar
        activeView={activeView}
        onSelectView={setActiveView}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        sessions={sessions}
        onNewChat={handleNewChat}
        userName={label}
        userPicture={picture}
        onLogout={handleLogout}
        loggingOut={loggingOut}
        calendarConnected={calendarConnected}
        meetConnected={meetConnected}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      <main className="flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden bg-black">
        {activeView === "chat" ? (
          <ChatPanel
            sessionToken={sessionToken}
            activeSessionId={activeSessionId}
            isSidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            calendarConnected={calendarConnected}
            onOpenConnections={() => setActiveView("connections")}
            onThreadCreated={loadThreadsList}
          />
        ) : (
          <ConnectionsPanel
            sessionToken={sessionToken}
            isSidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          />
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
