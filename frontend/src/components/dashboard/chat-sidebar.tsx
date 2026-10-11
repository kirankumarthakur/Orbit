"use client";

import { motion, AnimatePresence } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  LogOut,
  MessageSquare,
  PanelLeftClose,
  Plus,
  Radio,
  Video,
} from "lucide-react";

export interface ChatSession {
  id: string;
  title: string;
  timestamp?: string;
}

interface ChatSidebarProps {
  activeView: "chat" | "connections";
  onSelectView: (view: "chat" | "connections") => void;
  activeSessionId?: string;
  onSelectSession?: (id: string) => void;
  sessions?: ChatSession[];
  onNewChat: () => void;
  userName: string;
  userPicture?: string;
  onLogout: () => void;
  loggingOut?: boolean;
  calendarConnected?: boolean;
  meetConnected?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function ChatSidebar({
  activeView,
  onSelectView,
  activeSessionId,
  onSelectSession,
  sessions = [],
  onNewChat,
  userName,
  userPicture,
  onLogout,
  loggingOut,
  calendarConnected = false,
  meetConnected = false,
  isOpen = true,
  onToggle,
}: ChatSidebarProps) {
  const displayName = userName || "Signed In user";
  const initials = displayName.slice(0, 2).toUpperCase();

  const renderCollapseButton = () => {
    if (!onToggle) return null;
    return (
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggle}
        className="flex size-7 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        title="Collapse sidebar"
      >
        <PanelLeftClose className="size-4" />
      </motion.button>
    );
  };

  const renderBrandHeader = () => {
    return (
      <div className="flex items-center justify-between pb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl border border-periwinkle/30 bg-periwinkle/15 text-periwinkle">
            <Radio className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-wider text-white">
              ORBIT
            </span>
            <span className="text-[10px] text-white/40">Schedule Assistant</span>
          </div>
        </div>
        {renderCollapseButton()}
      </div>
    );
  };

  const renderNewChatButton = () => {
    return (
      <motion.button
        type="button"
        whileHover={{ scale: 1.15, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={onNewChat}
        className="flex size-6 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        title="New Chat"
      >
        <Plus className="size-3.5 text-periwinkle" />
      </motion.button>
    );
  };

  const renderSessionItem = (session: ChatSession) => {
    const isSelected = activeSessionId === session.id && activeView === "chat";
    const buttonClasses = isSelected
      ? "bg-white/[0.08] text-white font-medium shadow-xs"
      : "text-white/60 hover:bg-white/[0.03] hover:text-white";

    return (
      <motion.button
        key={session.id}
        type="button"
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={() => {
          onSelectSession?.(session.id);
          onSelectView("chat");
        }}
        className={`group flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${buttonClasses}`}
      >
        <MessageSquare className="size-3.5 text-white/40 shrink-0" />
        <span className="truncate flex-1">{session.title}</span>
      </motion.button>
    );
  };

  const renderEmptySessionsState = () => {
    return (
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNewChat}
        className="flex w-full items-center gap-2 rounded-xl border border-dashed border-white/10 px-3 py-2 text-xs text-white/40 hover:border-white/20 hover:text-white/70 transition-all"
      >
        <Plus className="size-3.5 text-periwinkle" />
        <span>Start a new chat</span>
      </motion.button>
    );
  };

  const renderSessionsList = () => {
    return (
      <ScrollArea className="flex-1 -mx-1 px-1 pt-1">
        <div className="flex flex-col gap-1">
          {sessions.length > 0
            ? sessions.map((session) => renderSessionItem(session))
            : renderEmptySessionsState()}
        </div>
      </ScrollArea>
    );
  };

  const renderChatsSection = () => {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">
            Chats
          </span>
          {renderNewChatButton()}
        </div>
        {renderSessionsList()}
      </div>
    );
  };

  const renderManageConnectionsButton = () => {
    return (
      <motion.button
        type="button"
        whileHover={{ scale: 1.15, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onSelectView("connections")}
        className="flex size-6 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        title="Manage connections"
      >
        <Plus className="size-3.5 text-periwinkle" />
      </motion.button>
    );
  };

  const renderActiveStatusPill = () => {
    return (
      <>
        <span className="size-1.5 rounded-full bg-lime animate-pulse" />
        <span className="text-lime font-medium">Active</span>
      </>
    );
  };

  const renderInactiveStatusPill = () => {
    return (
      <>
        <span className="size-1.5 rounded-full bg-white/30" />
        <span className="text-white/40">Inactive</span>
      </>
    );
  };

  const renderConnectionStatusBadge = (connected: boolean) => {
    return (
      <span className="flex items-center gap-1.5 text-[10px]">
        {connected ? renderActiveStatusPill() : renderInactiveStatusPill()}
      </span>
    );
  };

  const renderCalendarConnectionItem = () => {
    const isSelected = activeView === "connections";
    const itemClass = isSelected
      ? "bg-white/[0.08] text-white font-medium shadow-xs"
      : "text-white/60 hover:bg-white/[0.03] hover:text-white";

    return (
      <motion.button
        type="button"
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={() => onSelectView("connections")}
        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors ${itemClass}`}
      >
        <div className="flex items-center gap-2">
          <Calendar className="size-3.5 text-periwinkle" />
          <span>Google Calendar</span>
        </div>
        {renderConnectionStatusBadge(calendarConnected)}
      </motion.button>
    );
  };

  const renderMeetConnectionItem = () => {
    const isSelected = activeView === "connections";
    const itemClass = isSelected
      ? "bg-white/[0.08] text-white font-medium shadow-xs"
      : "text-white/60 hover:bg-white/[0.03] hover:text-white";

    return (
      <motion.button
        type="button"
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={() => onSelectView("connections")}
        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors ${itemClass}`}
      >
        <div className="flex items-center gap-2">
          <Video className="size-3.5 text-periwinkle" />
          <span>Google Meet</span>
        </div>
        {renderConnectionStatusBadge(meetConnected)}
      </motion.button>
    );
  };

  const renderConnectionsSection = () => {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">
            Connections
          </span>
          {renderManageConnectionsButton()}
        </div>
        <div className="flex flex-col gap-1 pt-1">
          {renderCalendarConnectionItem()}
          {renderMeetConnectionItem()}
        </div>
      </div>
    );
  };

  const renderUserAvatar = () => {
    return (
      <Avatar size="sm" className="size-8 border border-white/10 bg-jet-black">
        {userPicture && <AvatarImage src={userPicture} alt={displayName} />}
        <AvatarFallback className="bg-jet-black text-xs font-medium text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  };

  const renderLogoutButton = () => {
    return (
      <motion.button
        type="button"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={onLogout}
        disabled={loggingOut}
        className="flex size-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
        title="Log out"
      >
        <LogOut className="size-3.5" />
      </motion.button>
    );
  };

  const renderUserProfileFooter = () => {
    return (
      <div className="flex items-center justify-between px-1 pt-0.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {renderUserAvatar()}
          <span className="truncate text-xs font-medium text-white">
            {displayName}
          </span>
        </div>
        {renderLogoutButton()}
      </div>
    );
  };

  const renderSidebarContent = () => {
    return (
      <div className="flex h-full w-[272px] flex-col p-3">
        {renderBrandHeader()}
        <div className="flex flex-1 flex-col overflow-hidden gap-3">
          {renderChatsSection()}
          <Separator className="bg-white/10" />
          {renderConnectionsSection()}
        </div>
        <Separator className="my-2.5 bg-white/10" />
        {renderUserProfileFooter()}
      </div>
    );
  };

  const renderAside = () => {
    return (
      <motion.aside
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 272, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        className="fixed md:relative inset-y-0 left-0 z-40 md:z-auto h-full shrink-0 overflow-hidden border-r border-white/10 bg-jet-black md:bg-jet-black/60 select-none"
      >
        {renderSidebarContent()}
      </motion.aside>
    );
  };

  return (
    <AnimatePresence initial={false}>
      {isOpen && renderAside()}
    </AnimatePresence>
  );
}

export default ChatSidebar;
