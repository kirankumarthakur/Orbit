"use client";

import { useState, useRef, useEffect, useCallback, ReactNode, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SmoothButton from "@/components/smoothui/smooth-button";
import AIMessage from "@/components/smoothui/ai-message";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Brain,
  Calendar,
  CalendarOff,
  Clock,
  Loader2,
  PanelLeft,
  Sparkles,
  Video,
  Wrench,
} from "lucide-react";
import { fetchThreadMessages, streamAgentMessage } from "@/lib/agent";
import type { AgentActivity } from "@/lib/types";

export interface MessageItem {
  id: string;
  from: "user" | "assistant";
  text: string;
  timestamp?: string;
}

interface ChatPanelProps {
  sessionToken: string;
  activeSessionId: string;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  calendarConnected?: boolean;
  onOpenConnections?: () => void;
  onThreadCreated?: () => void;
  connections?: ReactNode;
  footer?: ReactNode;
  placeholder?: string;
}

const REMARK_PLUGINS = [remarkGfm];

const MARKDOWN_COMPONENTS = {
  a: ({ ...props }: React.ComponentProps<"a">) => (
    <a
      {...props}
      target="_blank"
      rel="noreferrer"
      className="text-periwinkle underline underline-offset-2 hover:text-periwinkle/80 transition-colors"
    />
  ),
  h1: ({ ...props }: React.ComponentProps<"h1">) => (
    <h1 {...props} className="mt-3 mb-1.5 text-base font-bold text-white" />
  ),
  h2: ({ ...props }: React.ComponentProps<"h2">) => (
    <h2 {...props} className="mt-2.5 mb-1 text-sm font-semibold text-white" />
  ),
  h3: ({ ...props }: React.ComponentProps<"h3">) => (
    <h3 {...props} className="mt-2 mb-1 text-xs font-semibold text-white" />
  ),
  p: ({ ...props }: React.ComponentProps<"p">) => (
    <p {...props} className="my-1.5 leading-relaxed" />
  ),
  ul: ({ ...props }: React.ComponentProps<"ul">) => (
    <ul {...props} className="my-2 list-disc pl-5 space-y-1" />
  ),
  ol: ({ ...props }: React.ComponentProps<"ol">) => (
    <ol {...props} className="my-2 list-decimal pl-5 space-y-1" />
  ),
  li: ({ ...props }: React.ComponentProps<"li">) => (
    <li {...props} className="leading-relaxed" />
  ),
  strong: ({ ...props }: React.ComponentProps<"strong">) => (
    <strong {...props} className="font-semibold text-white" />
  ),
  em: ({ ...props }: React.ComponentProps<"em">) => (
    <em {...props} className="italic text-white/90" />
  ),
  blockquote: ({ ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote
      {...props}
      className="my-2 border-l-2 border-periwinkle/40 pl-3 italic text-xs text-white/70"
    />
  ),
  pre: ({ ...props }: React.ComponentProps<"pre">) => (
    <pre
      {...props}
      className="my-2.5 overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-xs text-white/90"
    />
  ),
  code: ({ className, children, ...props }: React.ComponentProps<"code">) => {
    const isInline = !className && typeof children === "string" && !children.includes("\n");
    if (isInline) {
      return (
        <code
          {...props}
          className="rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-periwinkle"
        >
          {children}
        </code>
      );
    }
    return (
      <code {...props} className={className}>
        {children}
      </code>
    );
  },
  table: ({ ...props }: React.ComponentProps<"table">) => (
    <div className="my-2.5 overflow-x-auto rounded-xl border border-white/10">
      <table {...props} className="w-full border-collapse text-left text-xs" />
    </div>
  ),
  thead: ({ ...props }: React.ComponentProps<"thead">) => (
    <thead {...props} className="border-b border-white/15 bg-white/[0.04]" />
  ),
  tbody: ({ ...props }: React.ComponentProps<"tbody">) => (
    <tbody {...props} className="divide-y divide-white/5" />
  ),
  th: ({ ...props }: React.ComponentProps<"th">) => (
    <th {...props} className="px-3 py-2 font-semibold text-white" />
  ),
  td: ({ ...props }: React.ComponentProps<"td">) => (
    <td {...props} className="px-3 py-2 text-white/80" />
  ),
  hr: ({ ...props }: React.ComponentProps<"hr">) => (
    <hr {...props} className="my-3 border-white/10" />
  ),
};

const MarkdownContent = memo(function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="max-w-none break-words text-sm text-white/90">
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        components={MARKDOWN_COMPONENTS}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

interface ChatInputBarProps {
  onSend: (text: string) => void;
  isGenerating: boolean;
  placeholder?: string;
}

const ChatInputBar = memo(function ChatInputBar({
  onSend,
  isGenerating,
  placeholder,
}: ChatInputBarProps) {
  const [text, setText] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed || isGenerating) return;
      onSend(trimmed);
      setText("");
    }
  };

  const handleSendClick = () => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-jet-black/60 p-2 focus-within:border-periwinkle/50 focus-within:bg-jet-black/80">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Ask Orbit to schedule a meeting, check your agenda, or find free slots..."}
        rows={2}
        disabled={isGenerating}
        className="max-h-48 min-h-[44px] flex-1 resize-none overflow-y-auto bg-transparent px-3 py-1.5 text-sm text-white placeholder:text-white/40 focus:outline-none disabled:opacity-50"
      />
      <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
        <SmoothButton
          size="icon-sm"
          variant="solid"
          color="accent"
          shape="pill"
          disabled={!text.trim() || isGenerating}
          onClick={handleSendClick}
          className="mb-1 shrink-0 bg-periwinkle text-black hover:bg-periwinkle/90 disabled:opacity-30"
        >
          <ArrowUp className="size-4" />
        </SmoothButton>
      </motion.div>
    </div>
  );
});

export function ChatPanel({
  sessionToken,
  activeSessionId,
  isSidebarOpen,
  onToggleSidebar,
  calendarConnected = false,
  onOpenConnections,
  onThreadCreated,
  connections,
  footer,
  placeholder,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<AgentActivity | null>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const conversationContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const [showScrollBottomButton, setShowScrollBottomButton] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getScrollViewport = useCallback((): HTMLElement | null => {
    if (!conversationContainerRef.current) return null;
    return conversationContainerRef.current.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    );
  }, []);

  const handleScroll = useCallback(() => {
    const viewport = getScrollViewport();
    if (!viewport) return;
    const distanceFromBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    const isBottom = distanceFromBottom < 80;
    isAtBottomRef.current = isBottom;
    setShowScrollBottomButton(!isBottom);
  }, [getScrollViewport]);

  const scrollToBottom = useCallback((smooth = false) => {
    const viewport = getScrollViewport();
    if (viewport) {
      if (smooth) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      } else {
        viewport.scrollTop = viewport.scrollHeight;
      }
    } else {
      scrollEndRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, [getScrollViewport]);

  const loadMessages = useCallback(async () => {
    if (!sessionToken || !activeSessionId) return;
    try {
      const history = await fetchThreadMessages(sessionToken, activeSessionId);
      if (history && history.length > 0) {
        setMessages(
          history.map((m) => ({
            id: m.id,
            from: m.role === "assistant" ? "assistant" : "user",
            text: m.content,
          })),
        );
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  }, [sessionToken, activeSessionId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const viewport = getScrollViewport();
    if (!viewport) return;
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, [getScrollViewport, handleScroll, messages.length]);

  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom(false);
    }
  }, [messages, currentActivity, scrollToBottom]);

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isGenerating || !sessionToken || !activeSessionId) return;

      const userTimestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const userMessage: MessageItem = {
        id: `user-${Date.now()}`,
        from: "user",
        text: trimmed,
        timestamp: userTimestamp,
      };

      const assistantId = `assistant-${Date.now()}`;
      const initialAssistantMessage: MessageItem = {
        id: assistantId,
        from: "assistant",
        text: "",
        timestamp: userTimestamp,
      };

      setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
      setIsGenerating(true);
      isAtBottomRef.current = true;
      setShowScrollBottomButton(false);
      scrollToBottom(true);
      setCurrentActivity({
        stage: "thinking",
        message: "Analyzing scheduling context and planning next steps...",
      });

      const controller = new AbortController();
      abortControllerRef.current = controller;

      await streamAgentMessage({
        token: sessionToken,
        threadId: activeSessionId,
        message: trimmed,
        signal: controller.signal,
        onToken: (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: m.text + chunk } : m,
            ),
          );
        },
        onActivity: (activity) => {
          setCurrentActivity(activity);
        },
        onComplete: () => {
          setIsGenerating(false);
          setCurrentActivity(null);
          if (onThreadCreated) {
            onThreadCreated();
          }
        },
        onError: (error) => {
          setIsGenerating(false);
          setCurrentActivity(null);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    text: m.text
                      ? `${m.text}\n\n*Error: ${error}*`
                      : `*Error: ${error}*`,
                  }
                : m,
            ),
          );
        },
      });
    },
    [
      isGenerating,
      sessionToken,
      activeSessionId,
      scrollToBottom,
      onThreadCreated,
    ],
  );

  const getActivityStageIcon = (activity: AgentActivity) => {
    switch (activity.stage) {
      case "thinking":
        return <Brain className="size-3.5 text-periwinkle animate-pulse" />;
      case "tool_call":
        if (activity.toolName === "createGoogleMeetSpace") {
          return <Video className="size-3.5 text-blue-400 animate-pulse" />;
        }
        return <Calendar className="size-3.5 text-lime animate-pulse" />;
      case "analyzing":
        return <Activity className="size-3.5 text-cyan-400 animate-pulse" />;
      case "generating":
        return <Sparkles className="size-3.5 text-periwinkle animate-spin" />;
      default:
        return <Loader2 className="size-3.5 text-white/60 animate-spin" />;
    }
  };

  const getActivityStageBadgeClass = (activity: AgentActivity) => {
    switch (activity.stage) {
      case "thinking":
        return "border-periwinkle/30 bg-periwinkle/10 text-periwinkle";
      case "tool_call":
        return "border-lime/30 bg-lime/10 text-lime";
      case "analyzing":
        return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
      case "generating":
        return "border-purple-500/30 bg-purple-500/10 text-purple-300";
      default:
        return "border-white/10 bg-white/[0.04] text-white/70";
    }
  };

  const renderActivityBadge = (activity: AgentActivity) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium shadow-xs transition-colors ${getActivityStageBadgeClass(activity)}`}
      >
        {getActivityStageIcon(activity)}
        <span>{activity.message}</span>
      </motion.div>
    );
  };

  const renderMessageAvatar = (from: "user" | "assistant") => {
    if (from === "assistant") {
      return (
        <Avatar size="sm" className="size-8 border border-periwinkle/30 bg-periwinkle/15">
          <AvatarFallback className="bg-periwinkle/15 text-[11px] font-semibold text-periwinkle">
            AI
          </AvatarFallback>
        </Avatar>
      );
    }
    return (
      <Avatar size="sm" className="size-8 border border-white/15 bg-jet-black">
        <AvatarFallback className="bg-jet-black text-[11px] font-semibold text-white">
          U
        </AvatarFallback>
      </Avatar>
    );
  };

  const renderUserContent = (text: string) => {
    return (
      <div className="rounded-2xl border border-white/15 bg-white/[0.08] px-4 py-2.5 text-sm leading-relaxed text-white">
        <span className="whitespace-pre-wrap">{text}</span>
      </div>
    );
  };

  const renderAssistantContent = (
    text: string,
    isStreamingThisMessage: boolean,
    activity: AgentActivity | null,
  ) => {
    const showActivityBadge = isStreamingThisMessage && activity;
    const hasText = Boolean(text.trim());

    return (
      <div className="flex flex-col gap-2 py-1 text-sm leading-relaxed text-white">
        {showActivityBadge && (
          <div className="pt-0.5 pb-1">
            {renderActivityBadge(activity)}
          </div>
        )}

        {hasText && <MarkdownContent content={text} />}

        {!hasText && !showActivityBadge && isStreamingThisMessage && (
          <div className="flex items-center gap-2 py-1 text-xs text-white/50">
            <Loader2 className="size-3.5 animate-spin text-periwinkle" />
            <span>Orbit is preparing your schedule...</span>
          </div>
        )}
      </div>
    );
  };

  const renderMessageItem = (item: MessageItem, index: number) => {
    const isLastAssistant =
      item.from === "assistant" && index === messages.length - 1;
    const isStreamingThisMessage = isGenerating && isLastAssistant;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        <AIMessage
          from={item.from}
          bubble={false}
          copyText={item.text}
          avatar={renderMessageAvatar(item.from)}
        >
          {item.from === "user"
            ? renderUserContent(item.text)
            : renderAssistantContent(item.text, isStreamingThisMessage, currentActivity)}
        </AIMessage>
      </motion.div>
    );
  };

  const renderCalendarWarningBanner = () => {
    if (calendarConnected) {
      return null;
    }

    return (
      <div className="flex items-center justify-between rounded-xl border border-orange/20 bg-orange/5 px-3 py-1.5 text-xs text-orange">
        <div className="flex items-center gap-2">
          <CalendarOff className="size-3.5 text-orange shrink-0" />
          <span>Calendar not connected. Some schedule queries require calendar access.</span>
        </div>
        {onOpenConnections && (
          <button
            type="button"
            onClick={onOpenConnections}
            className="rounded-lg bg-orange/15 px-2 py-0.5 text-xs font-medium text-orange hover:bg-orange/25"
          >
            Connect now
          </button>
        )}
      </div>
    );
  };

  const renderTopBar = () => {
    return (
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/5 px-4">
        <div className="flex items-center gap-2">
          {!isSidebarOpen && onToggleSidebar && (
            <motion.button
              type="button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onToggleSidebar}
              className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white"
            >
              <PanelLeft className="size-4" />
            </motion.button>
          )}
          <span className="text-xs font-medium text-white/80">Orbit Assistant</span>
        </div>
      </div>
    );
  };

  const renderInputBar = () => {
    return (
      <ChatInputBar
        onSend={handleSend}
        isGenerating={isGenerating}
        placeholder={placeholder}
      />
    );
  };

  const renderEmptyStateView = () => {
    return (
      <div className="mx-auto flex h-full max-w-2xl flex-1 flex-col items-center justify-center p-6 select-none">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-periwinkle/30 bg-periwinkle/15 text-periwinkle shadow-md"
        >
          <Sparkles className="size-6" />
        </motion.div>

        <h2 className="text-lg font-semibold text-white">
          What can I help you schedule?
        </h2>
        <p className="mt-1 text-xs text-white/50 text-center max-w-md">
          Ask Orbit to check your schedule, book a Google Meet call, find free time slots, or resolve calendar conflicts.
        </p>

        {renderCalendarWarningBanner()}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-4 w-full"
        >
          {renderInputBar()}
        </motion.div>

        {connections && <div className="mt-4 w-full">{connections}</div>}
        {footer && <div className="mt-4 w-full">{footer}</div>}
      </div>
    );
  };

  const renderScrollToBottomButton = () => {
    if (!showScrollBottomButton) return null;

    return (
      <div className="absolute bottom-24 right-8 z-20">
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            isAtBottomRef.current = true;
            setShowScrollBottomButton(false);
            scrollToBottom(true);
          }}
          className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-jet-black/90 text-white/80 shadow-lg backdrop-blur-md transition-colors hover:bg-jet-black hover:text-white"
          title="Scroll to bottom"
        >
          <ArrowDown className="size-4 text-periwinkle" />
        </motion.button>
      </div>
    );
  };

  const renderMessagesConversationView = () => {
    return (
      <div
        ref={conversationContainerRef}
        className="relative flex flex-1 min-h-0 flex-col overflow-hidden"
      >
        <ScrollArea className="flex-1 min-h-0 w-full">
          <div className="mx-auto flex max-w-3xl flex-col gap-5 px-6 py-6">
            <AnimatePresence initial={false}>
              {messages.map((item, index) => renderMessageItem(item, index))}
            </AnimatePresence>
            <div ref={scrollEndRef} />
          </div>
        </ScrollArea>

        {renderScrollToBottomButton()}

        <div className="shrink-0 border-t border-white/10 bg-jet-black/40 p-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-2">
            {renderCalendarWarningBanner()}
            {renderInputBar()}
            {footer && <div className="mt-2 w-full">{footer}</div>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-black text-white">
      {renderTopBar()}
      {messages.length === 0 ? renderEmptyStateView() : renderMessagesConversationView()}
    </div>
  );
}

export default ChatPanel;
