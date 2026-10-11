"use client";

import { useEffect, useRef, useCallback, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Sparkles,
  Users,
} from "lucide-react";

export interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  attendees?: number;
  isConflict?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  scheduleEvents?: ScheduleEvent[];
  conflictWarning?: string;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  isGenerating?: boolean;
  userInitials: string;
  onApplyAdjustment?: (eventId: string) => void;
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

export function ChatMessages({
  messages,
  isGenerating,
  userInitials,
  onApplyAdjustment,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const conversationContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

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
    isAtBottomRef.current = distanceFromBottom < 80;
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
      bottomRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, [getScrollViewport]);

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
  }, [messages, isGenerating, scrollToBottom]);

  const renderMessageAvatar = (isUser: boolean) => {
    const avatarBorderClass = isUser
      ? "border-white/20 bg-white/10"
      : "border-periwinkle/30 bg-periwinkle/15";
    const textClass = isUser ? "text-white" : "text-periwinkle";

    return (
      <Avatar size="sm" className={`size-8 shrink-0 border ${avatarBorderClass}`}>
        <AvatarFallback className={`text-xs font-medium ${textClass}`}>
          {isUser ? userInitials : "AI"}
        </AvatarFallback>
      </Avatar>
    );
  };

  const renderAuthorMetaHeader = (isUser: boolean) => {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium tracking-wide text-white/40">
          {isUser ? "You" : "Orbit Assistant"}
        </span>
      </div>
    );
  };

  const renderConflictWarning = (warning?: string) => {
    if (!warning) return null;

    return (
      <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-orange/20 bg-orange/10 p-3 text-xs text-orange">
        <AlertTriangle className="size-4 shrink-0 mt-0.5 text-orange" />
        <div className="flex flex-col gap-1">
          <span className="font-semibold tracking-wide">
            Scheduling Conflict Detected
          </span>
          <span className="text-orange/90">
            {warning}
          </span>
        </div>
      </div>
    );
  };

  const renderEventConflictBadge = () => {
    return (
      <Badge
        variant="destructive"
        className="h-5 rounded-md bg-orange/20 px-2 text-[10px] text-orange border border-orange/30"
      >
        Conflict
      </Badge>
    );
  };

  const renderEventConfirmedBadge = () => {
    return (
      <Badge
        variant="secondary"
        className="h-5 rounded-md bg-lime/10 px-2 text-[10px] text-lime border border-lime/20"
      >
        Confirmed
      </Badge>
    );
  };

  const renderEventStatusBadge = (isConflict?: boolean) => {
    return isConflict ? renderEventConflictBadge() : renderEventConfirmedBadge();
  };

  const renderAttendeesSlot = (attendees?: number) => {
    if (attendees === undefined) return null;

    return (
      <>
        <span className="text-white/20">•</span>
        <div className="flex items-center gap-1">
          <Users className="size-3 text-white/40" />
          <span className="tabular-nums">{attendees} attendees</span>
        </div>
      </>
    );
  };

  const renderEventMetadata = (evt: ScheduleEvent) => {
    return (
      <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
        <div className="flex items-center gap-1">
          <Clock className="size-3 text-white/40" />
          <span className="tabular-nums">{evt.time}</span>
        </div>
        <span className="text-white/20">•</span>
        <span className="tabular-nums">{evt.duration}</span>
        {renderAttendeesSlot(evt.attendees)}
      </div>
    );
  };

  const renderResolveConflictAction = (evtId: string, isConflict?: boolean) => {
    if (!isConflict || !onApplyAdjustment) return null;

    return (
      <Button
        size="xs"
        variant="outline"
        onClick={() => onApplyAdjustment(evtId)}
        className="rounded-lg border-orange/30 text-orange hover:bg-orange/10 hover:text-orange"
      >
        <Sparkles data-icon="inline-start" />
        Resolve conflict
      </Button>
    );
  };

  const renderEventItem = (evt: ScheduleEvent) => {
    const itemBorderClass = evt.isConflict
      ? "border-orange/30 bg-orange/[0.04]"
      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]";

    return (
      <div
        key={evt.id}
        className={`flex flex-col gap-2 rounded-xl border p-3 transition-colors ${itemBorderClass}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-white">
            {evt.title}
          </span>
          {renderEventStatusBadge(evt.isConflict)}
        </div>
        <div className="flex items-center justify-between gap-3">
          {renderEventMetadata(evt)}
          {renderResolveConflictAction(evt.id, evt.isConflict)}
        </div>
      </div>
    );
  };

  const renderScheduleEventsSection = (events?: ScheduleEvent[]) => {
    if (!events || events.length === 0) return null;

    return (
      <div className="mt-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-medium text-white/60">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-periwinkle" />
            <span>Identified Schedule Items</span>
          </span>
          <span className="tabular-nums text-white/40">
            {events.length} events
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {events.map((evt) => renderEventItem(evt))}
        </div>
      </div>
    );
  };

  const renderMessageBody = (content: string, isUser: boolean) => {
    if (isUser) {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }
    return <MarkdownContent content={content} />;
  };

  const renderMessageContentBubble = (message: ChatMessage, isUser: boolean) => {
    if (isUser) {
      return (
        <div className="rounded-2xl border border-white/15 bg-white/[0.08] px-4 py-2.5 text-sm leading-relaxed text-white">
          {renderMessageBody(message.content, isUser)}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2.5 py-1 text-sm leading-relaxed text-white/90">
        {renderMessageBody(message.content, isUser)}
        {renderConflictWarning(message.conflictWarning)}
        {renderScheduleEventsSection(message.scheduleEvents)}
      </div>
    );
  };

  const renderMessageItem = (message: ChatMessage) => {
    const isUser = message.role === "user";
    const directionClass = isUser ? "flex-row-reverse" : "flex-row";
    const alignmentClass = isUser ? "items-end" : "items-start";

    return (
      <div key={message.id} className={`flex gap-3.5 ${directionClass}`}>
        {renderMessageAvatar(isUser)}
        <div className={`flex max-w-[82%] flex-col gap-2 ${alignmentClass}`}>
          {renderAuthorMetaHeader(isUser)}
          {renderMessageContentBubble(message, isUser)}
        </div>
      </div>
    );
  };

  const renderGeneratingIndicator = () => {
    if (!isGenerating) return null;

    return (
      <div className="flex gap-3.5">
        <Avatar size="sm" className="size-8 shrink-0 border border-periwinkle/30 bg-periwinkle/15">
          <AvatarFallback className="text-xs font-medium text-periwinkle">
            AI
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-jet-black/60 px-4 py-3 text-xs text-white/60">
          <Sparkles className="size-3.5 animate-spin text-periwinkle" />
          <span>Analyzing calendar and preparing response...</span>
        </div>
      </div>
    );
  };

  const renderConversationList = () => {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
        {messages.map((message) => renderMessageItem(message))}
        {renderGeneratingIndicator()}
        <div ref={bottomRef} />
      </div>
    );
  };

  return (
    <div
      ref={conversationContainerRef}
      className="relative flex flex-1 min-h-0 flex-col overflow-hidden w-full h-full"
    >
      <ScrollArea className="flex-1 min-h-0 w-full">
        {renderConversationList()}
      </ScrollArea>
    </div>
  );
}

export default ChatMessages;
