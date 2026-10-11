import { Pool } from "pg";

let pool: Pool | null = null;

export const getPool = (): Pool => {
  try {
    if (!pool) {
      pool = new Pool({
        host: process.env.BACKEND_POSTGRES_HOST,
        port: Number(process.env.BACKEND_POSTGRES_PORT),
        user: process.env.BACKEND_POSTGRES_USER,
        password: process.env.BACKEND_POSTGRES_PASSWORD,
        database: process.env.BACKEND_POSTGRES_DB,
      });

      pool.on("error", (err) => {
        console.error("Unexpected error on idle database client", err);
      });
    }
    return pool;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create database pool");
  }
};

export const closePool = async (): Promise<void> => {
  try {
    if (pool) {
      await pool.end();
      pool = null;
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to close database pool");
  }
};
