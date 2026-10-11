import { PostgresStore } from "@mastra/pg";
import { Memory } from "@mastra/memory";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

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
