import { PostgresStore } from "@mastra/pg";
import { Memory } from "@mastra/memory";

const host = process.env.BACKEND_POSTGRES_HOST || "localhost";
const port = Number(process.env.BACKEND_POSTGRES_PORT) || 5432;
const user = process.env.BACKEND_POSTGRES_USER || "orbit_user";
const password = process.env.BACKEND_POSTGRES_PASSWORD || "orbit_password";
const database = process.env.BACKEND_POSTGRES_DB || "orbit_db";

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;

export const memoryStore = new PostgresStore({
  id: "orbit-postgres-memory-store",
  connectionString,
});

let memoryInstance: Memory | null = null;

export const createMemory = async (): Promise<Memory> => {
  if (memoryInstance) {
    return memoryInstance;
  }

  memoryInstance = new Memory({
    storage: memoryStore,
    options: {
      lastMessages: 20,
      workingMemory: {
        enabled: true,
        scope: "resource",
        template: `# Meeting preferences
- Timezone:
- Default meeting length (minutes):
- Preferred meeting times:
- Usual invitees:
- Notes:
`,
      },
    },
  });

  return memoryInstance;
};
