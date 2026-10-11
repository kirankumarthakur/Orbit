import { config } from "dotenv";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { closePool, getPool } from "../src/config/db/dbpool.js";

config({ path: resolve(import.meta.dirname, "../.env") });

const main = async () => {
  const sqlDir = resolve(import.meta.dirname, "../sql");
  const files = readdirSync(sqlDir)
    .filter((file: string) => file.endsWith(".sql"))
    .sort();

  const pool = getPool();
  try {
    for (const file of files) {
      const filePath = resolve(sqlDir, file);
      const sqlContent = readFileSync(filePath, "utf-8");
      await pool.query(sqlContent);

      console.log(`Executed migration: ${file}`);
    }
  } finally {
    await closePool();
  }
};

main()
  .then(() => {
    console.log("All migrations executed successfully.");
  })
  .catch((error) => {
    console.error("Error executing migrations:", error);
    process.exit(1);
  });
