import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getPool } from './config/db/dbpool.js';
import { connectionRouter } from './routes/connection.routes.js';
import { agentRouter } from './routes/agent.routes.js';

const app = express();
const port: number = Number(process.env.PORT) || 9999;

const allowedOrigins = (process.env.URI_FRONTEND || '')
  .split(',')
  .map((item) => item.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const normalized = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(normalized)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
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
      CREATE EXTENSION IF NOT EXISTS pgcrypto;

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        auth_user_id TEXT NOT NULL UNIQUE,
        email TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS connections (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider TEXT NOT NULL CHECK (provider IN ('calendar', 'meet')),
        status TEXT NOT NULL CHECK (status IN ('connected', 'disconnected', 'pending')),
        PRIMARY KEY (user_id, provider)
      );

      ALTER TABLE connections DROP CONSTRAINT IF EXISTS connections_provider_check;
      ALTER TABLE connections ADD CONSTRAINT connections_provider_check CHECK (provider IN ('calendar', 'meet'));
    `);
  } catch (error) {
    console.error('Error applying migrations:', error);
  }
};

app.listen(port, async () => {
  await ensureMigrations();
  console.log(`Server is running on port ${port}`);
});
