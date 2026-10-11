import { Agent } from '@mastra/core/agent';
import { createMemory } from '../config/agent/memory.js';
import { getAgentInstructions } from '../config/agent/instructions.js';
import { createCalendarTool } from './agentTools.service.js';

export type AgentActivityStage =
  | 'started'
  | 'thinking'
  | 'tool_call'
  | 'analyzing'
  | 'generating'
  | 'inprogress'
  | 'completed'
  | 'error';

export type AgentEvent = {
  type: AgentActivityStage | 'token';
  message?: string;
  token?: string;
  toolName?: string;
};

export type StreamingAgentEventInput = {
  userId: string;
  authUserId: string;
  threadId: string;
  message: string;
  onEvent: (event: AgentEvent) => void;
};

export type ChatThreadSummary = {
  id: string;
  title: string;
  updatedAt: string;
};

export type ChatThreadMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const modelName = () => {
  return process.env.GROQ_MODEL || 'groq/openai/gpt-oss-20b';
};

const getToolActionMessage = (toolName: string): string => {
  switch (toolName) {
    case 'listUpcomingEvents':
      return 'Checking upcoming calendar events...';
    case 'getCalendarBusy':
      return 'Analyzing availability and conflict windows...';
    case 'createCalendarEvent':
      return 'Scheduling calendar event and creating Meet link...';
    case 'updateCalendarEvent':
      return 'Rescheduling calendar event...';
    case 'deleteCalendarEvent':
      return 'Cancelling calendar event...';
    case 'createGoogleMeetSpace':
      return 'Creating instant Google Meet room...';
    default:
      return `Using tool ${toolName}...`;
  }
};

const getToolResultAnalysisMessage = (toolName: string): string => {
  switch (toolName) {
    case 'listUpcomingEvents':
      return 'Analyzing retrieved calendar schedule...';
    case 'getCalendarBusy':
      return 'Evaluating free and busy time intervals...';
    case 'createCalendarEvent':
      return 'Confirming booked calendar event...';
    case 'updateCalendarEvent':
      return 'Confirming updated schedule details...';
    case 'deleteCalendarEvent':
      return 'Confirming event cancellation...';
    case 'createGoogleMeetSpace':
      return 'Configuring Google Meet room details...';
    default:
      return `Processing output from ${toolName}...`;
  }
};

export const streamMessage = async (input: StreamingAgentEventInput) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }

    input.onEvent({
      type: 'thinking',
      message: 'Analyzing scheduling context and planning next steps...',
    });

    const memory = await createMemory();
    const agent = new Agent({
      id: 'meeting-assistant',
      name: 'Meeting Assistant',
      instructions: getAgentInstructions(),
      model: modelName(),
      tools: createCalendarTool(input.authUserId),
      memory,
    });

    const result = await agent.stream(input.message, {
      memory: {
        resource: input.authUserId,
        thread: input.threadId,
      },
    });

    let hasStartedGenerating = false;

    for await (const event of result.fullStream) {
      if (event.type === 'tool-call') {
        const toolName = (event.payload as any)?.toolName || 'tool';
        input.onEvent({
          type: 'tool_call',
          toolName,
          message: getToolActionMessage(toolName),
        });
        continue;
      }

      if (event.type === 'tool-result') {
        const toolName = (event.payload as any)?.toolName || 'tool';
        input.onEvent({
          type: 'analyzing',
          toolName,
          message: getToolResultAnalysisMessage(toolName),
        });
        continue;
      }

      if (event.type === 'text-delta') {
        if (!hasStartedGenerating) {
          hasStartedGenerating = true;
          input.onEvent({
            type: 'generating',
            message: 'Composing response...',
          });
        }
        const text = (event.payload as any)?.text ?? '';
        input.onEvent({ type: 'token', token: text, message: text });
        continue;
      }
    }

    const thread = await memory.getThreadById({
      threadId: input.threadId,
      resourceId: input.authUserId,
    });

    if (thread && !thread.title?.trim()) {
      await memory.updateThread({
        id: thread.id,
        title: input.message.slice(0, 80),
        metadata: thread.metadata ?? {},
      });
    }

    input.onEvent({ type: 'completed', message: 'Done' });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'An error occurred';
    input.onEvent({ type: 'error', message: errorMsg });
  }
};

export const getUserThreads = async (
  authUserId: string,
): Promise<ChatThreadSummary[]> => {
  try {
    const memory = await createMemory();
    const threads = await memory.listThreads({
      filter: { resourceId: authUserId },
      perPage: 30,
      orderBy: { field: 'updatedAt', direction: 'DESC' },
    });
    const threadList = Array.isArray(threads)
      ? threads
      : (threads as any)?.threads || [];
    return threadList.map((thread: any) => ({
      id: thread.id,
      title: thread.title?.trim() || 'New Chat Thread',
      updatedAt:
        thread.updatedAt instanceof Date
          ? thread.updatedAt.toISOString()
          : String(thread.updatedAt || new Date().toISOString()),
    }));
  } catch (error) {
    console.error('Error fetching user threads:', error);
    return [];
  }
};

const messageNormalize = (content: any): string => {
  if (typeof content === 'string') {
    return content.trim();
  }
  if (!content || typeof content !== 'object') {
    return '';
  }

  const record = content as {
    content?: unknown;
    parts?: Array<{ type?: string; text?: string }>;
  };

  if (typeof record.content === 'string' && record.content.trim()) {
    return record.content.trim();
  }

  if (Array.isArray(record.parts)) {
    return record.parts
      .filter(
        (part): part is { text: string } =>
          !!part && typeof part === 'object' && 'text' in part,
      )
      .map((part) => part.text)
      .join(' ');
  }

  return '';
};

export const getThreadMessages = async (
  authUserId: string,
  threadId: string,
): Promise<ChatThreadMessage[]> => {
  try {
    const memory = await createMemory();
    const thread = await memory.getThreadById({
      threadId,
      resourceId: authUserId,
    });

    if (!thread || thread.resourceId !== authUserId) {
      return [];
    }

    const recall = await memory.recall({
      threadId,
      resourceId: authUserId,
      perPage: false,
    });

    const messages: ChatThreadMessage[] = [];
    const recallMessages = (recall as any)?.messages || [];
    for (const message of recallMessages) {
      const normalizedContent = messageNormalize(message.content);
      if (!normalizedContent) {
        continue;
      }

      const role =
        message.role === 'user' || message.role === 'assistant'
          ? message.role
          : 'system';

      messages.push({
        id: message.id,
        role: role,
        content: normalizedContent,
      });
    }
    return messages;
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    return [];
  }
};
