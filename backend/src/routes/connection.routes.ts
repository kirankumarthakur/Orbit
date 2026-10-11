import { Router } from "express";
import { z } from "zod";
import { requireSession } from "../middleware/requireSession.js";
import {
  createProviderConnection,
  getConnections,
  refreshProviderConnection,
} from "../services/connectionService.js";

export const connectionRouter = Router();
connectionRouter.use(requireSession);

const connectSchema = z.object({
  provider: z.enum(["calendar", "meet"]).optional().default("calendar"),
  refreshToken: z.string().min(1, "Missing refresh token"),
  redirectUrl: z.string().optional(),
});

const refreshSchema = z.object({
  provider: z.enum(["calendar", "meet"]).optional().default("calendar"),
});

connectionRouter.get("/", async (req, res) => {
  try {
    if (!req.authContext?.userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized", success: false });
    }

    const connections = await getConnections(
      req.authContext.userId,
      req.authContext.authUserId,
    );

    res.json({
      success: true,
      connections,
    });
  } catch {
    res
      .status(500)
      .json({ error: "Failed to fetch connections", success: false });
  }
});

connectionRouter.post("/connect", async (req, res) => {
  try {
    if (!req.authContext?.userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized", success: false });
    }

    const parsed = connectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({
          error: parsed.error.issues[0]?.message ?? "Invalid request body",
          success: false,
        });
    }

    const redirectUrl =
      parsed.data.redirectUrl ||
      process.env.URI_FRONTEND ||
      "http://localhost:3000";

    const result = await createProviderConnection(
      req.authContext.userId,
      parsed.data.provider,
      parsed.data.refreshToken,
      redirectUrl,
    );

    res.json({
      success: true,
      connection: result,
    });
  } catch (error) {
    console.error("Error connecting provider:", error);
    res.status(500).json({ error: "Failed to connect", success: false });
  }
});

connectionRouter.post("/refresh", async (req, res) => {
  try {
    if (!req.authContext?.userId || !req.authContext?.authUserId) {
      return res
        .status(401)
        .json({ error: "Unauthorized", success: false });
    }

    const parsed = refreshSchema.safeParse(req.body);
    const provider = parsed.success ? parsed.data.provider : "calendar";

    const conn = await refreshProviderConnection(
      req.authContext.userId,
      req.authContext.authUserId,
      provider,
    );

    res.json({
      success: true,
      connection: conn,
    });
  } catch (error) {
    console.error("Error refreshing connection:", error);
    res
      .status(500)
      .json({ error: "Failed to refresh connection", success: false });
  }
});
