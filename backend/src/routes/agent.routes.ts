import { Router } from 'express';
import { z } from 'zod';
import { requireSession } from '../middleware/requireSession.js';
import {
  getThreadMessages,
  getUserThreads,
  streamMessage,
} from '../services/agent.service.js';

export const agentRouter = Router();
agentRouter.use(requireSession);

const chatSchema = z.object({
  message: z.string().trim().min(1).max(5000),
  threadId: z.string().trim().min(1),
});

const threadIdSchema = z.string().trim().min(1);

agentRouter.get('/threads', async (req, res) => {
  try {
    const authUserId = req.authContext?.authUserId;
    if (!authUserId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const threads = await getUserThreads(authUserId);
    res.status(200).json({
      success: true,
      threads: threads || [],
    });
  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch threads',
    });
  }
});

agentRouter.get('/threads/:threadId', async (req, res) => {
  try {
    const authUserId = req.authContext?.authUserId;
    if (!authUserId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const valid = threadIdSchema.safeParse(req.params.threadId);
    if (!valid.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid thread ID',
      });
    }

    const messages = await getThreadMessages(
      authUserId,
      valid.data,
    );

    res.status(200).json({
      success: true,
      messages: messages || [],
      threadId: valid.data,
    });
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch thread messages',
    });
  }
});

agentRouter.post('/chat', async (req, res) => {
  try {
    const authUserId = req.authContext?.authUserId;
    if (!authUserId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const valid = chatSchema.safeParse(req.body);
    if (!valid.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body',
      });
    }

    const userId = req.authContext?.userId || authUserId;

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const write = (event: Record<string, any>) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    try {
      await streamMessage({
        userId: userId,
        authUserId: authUserId,
        message: valid.data.message,
        threadId: valid.data.threadId,
        onEvent: write,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      write({ type: 'error', message });
    } finally {
      res.end();
    }
  } catch (error) {
    console.error('Error sending message:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
      });
    }
  }
});
