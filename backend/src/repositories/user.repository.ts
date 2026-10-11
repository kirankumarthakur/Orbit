import { getPool } from "../config/db/dbpool.js";

export type User = {
  id: string;
  auth_user_id: string;
  email: string | null;
  created_at: Date;
};

export const upsertUser = async (
  auth_user_id: string,
  email?: string,
): Promise<User> => {
  const result = await getPool().query<User>(
    `
    INSERT INTO users (auth_user_id, email)
    VALUES ($1, $2)
    ON CONFLICT (auth_user_id)
    DO UPDATE SET email = COALESCE(EXCLUDED.email, users.email)
    RETURNING *
    `,
    [auth_user_id, email ?? null],
  );

  return result.rows[0];
};
