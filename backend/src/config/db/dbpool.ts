import { Pool } from "pg";

let pool: Pool | null = null;

export const getPool = (): Pool => {
  try {
    if (!pool) {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set");
      }

      pool = new Pool({
        connectionString,
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
