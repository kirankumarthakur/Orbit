import { apiCall } from "./services/api";
import type { AgentActivity, AgentActivityStage } from "./types";

export type ChatThread = {
  id: string;
  title: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export const fetchThreads = async (token: string): Promise<ChatThread[]> => {
  try {
    const response = await apiCall<{
      success: boolean;
      threads: ChatThread[];
    }>("/agent/threads", { token });
    return response.threads || [];
  } catch {
    return [];
  }
};

export const fetchThreadMessages = async (
  token: string,
  threadId: string,
): Promise<ChatMessage[]> => {
  try {
    const response = await apiCall<{
      success: boolean;
      messages: ChatMessage[];
    }>(`/agent/threads/${threadId}`, { token });
    return response.messages || [];
  } catch {
    return [];
  }
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999/api/v1";

export const streamAgentMessage = async ({
  token,
  threadId,
  message,
  onToken,
  onActivity,
  onStatus,
  onComplete,
  onError,
  signal,
}: {
  token: string;
  threadId: string;
  message: string;
  onToken: (token: string) => void;
  onActivity?: (activity: AgentActivity) => void;
  onStatus?: (status: string) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
  signal?: AbortSignal;
}): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/agent/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message, threadId }),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Chat request failed: ${response.status} ${errText}`);
    }

    if (!response.body) {
      throw new Error("No response stream available");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data:")) continue;

        const jsonStr = line.replace(/^data:\s*/, "");
        if (!jsonStr) continue;

        try {
          const event = JSON.parse(jsonStr);
          if (event.type === "token") {
            const tokenText = event.token || event.message || "";
            if (tokenText) onToken(tokenText);
          } else if (
            event.type === "thinking" ||
            event.type === "tool_call" ||
            event.type === "analyzing" ||
            event.type === "generating" ||
            event.type === "inprogress" ||
            event.type === "started"
          ) {
            const stage: AgentActivityStage =
              event.type === "inprogress" || event.type === "started"
                ? "thinking"
                : event.type;
            const statusMsg = event.message || "Working on your schedule...";
            if (onActivity) {
              onActivity({
                stage,
                message: statusMsg,
                toolName: event.toolName,
              });
            }
            if (onStatus) {
              onStatus(statusMsg);
            }
          } else if (event.type === "completed") {
            if (onActivity) {
              onActivity({ stage: "completed", message: "Done" });
            }
            if (onComplete) onComplete();
          } else if (event.type === "error") {
            const errorMsg = event.message || "An error occurred";
            if (onActivity) {
              onActivity({ stage: "error", message: errorMsg });
            }
            if (onError) onError(errorMsg);
          }
        } catch {}
      }
    }

    if (onComplete) onComplete();
  } catch (error: any) {
    if (signal?.aborted) return;
    if (onError) {
      onError(error?.message || "Connection error during chat streaming");
    }
  }
};
