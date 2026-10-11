import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getPool } from './config/db/dbpool.js';
import { connectionRouter } from './routes/connection.routes.js';
import { agentRouter } from './routes/agent.routes.js';

const app = express();
const port: number = Number(process.env.PORT) || 9999;

const allowedOrigins = [
  process.env.URI_FRONTEND,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  }),
);
app.use(express.json());

app.get('/api/v1/health', async (_req, res) => {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    res
      .status(200)
      .json({ status: 'ok', service: 'orbit_backend', database: 'up' });
  } catch (error) {
    console.error('Database health check error:', error);
    res
      .status(503)
      .json({ status: 'error', service: 'orbit_backend', database: 'down' });
  }
});

app.use('/api/v1/connections', connectionRouter);
app.use('/api/v1/agent', agentRouter);

const ensureMigrations = async () => {
  try {
    const pool = getPool();
    await pool.query(`
      ALTER TABLE connections DROP CONSTRAINT IF EXISTS connections_provider_check;
      ALTER TABLE connections ADD CONSTRAINT connections_provider_check CHECK (provider IN ('calendar', 'meet'));
    `);
  } catch (error) {
    console.error('Error applying connections migration:', error);
  }
};

app.listen(port, async () => {
  await ensureMigrations();
  console.log(`Server is running on port ${port}`);
});
