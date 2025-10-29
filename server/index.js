/**
 * The starting point of the server.
 *
 * Author: Johanna Wirell
 * Version: 1.1.0
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { router } from './routes/router.js';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

dotenv.config();

const PORT = process.env.PORT || 4000;
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const main = async () => {
  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(helmet());

  // 🧩 FIX: Important Redis config for BullMQ
  const connection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  // Make queue available throughout the app
  app.locals.episodeQueue = new Queue('episodeQueue', { connection });

  app.use('/', router);

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop.');
  });
};

main().catch(console.error);
