import { getPool } from "../config/db/dbpool.js";

export type ConnectionStatus = "connected" | "disconnected" | "pending";

export type ConnectionRow = {
  user_id: string;
  provider: string;
  status: ConnectionStatus;
};

export const getConnectionFromDB = async (
  userId: string,
  provider: string,
): Promise<ConnectionRow | null> => {
  const result = await getPool().query<ConnectionRow>(
    `
      SELECT user_id, provider, status FROM connections
      WHERE user_id = $1 AND provider = $2
      `,
    [userId, provider],
  );
  return result.rows[0] ?? null;
};

export const getAllConnectionsFromDB = async (
  userId: string,
): Promise<ConnectionRow[]> => {
  const result = await getPool().query<ConnectionRow>(
    `
      SELECT user_id, provider, status FROM connections
      WHERE user_id = $1
      `,
    [userId],
  );
  return result.rows;
};

export const upsertConnectionInDB = async (
  userId: string,
  provider: string,
  status: ConnectionStatus,
): Promise<ConnectionRow | null> => {
  const result = await getPool().query<ConnectionRow>(
    `
      INSERT INTO connections (user_id, provider, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, provider)
      DO UPDATE SET status = EXCLUDED.status
      RETURNING user_id, provider, status
      `,
    [userId, provider, status],
  );
  return result.rows[0] || null;
};

