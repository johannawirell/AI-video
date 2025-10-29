/**
 * The starting point of the server.
 *
 * @author Johanna Wirell
 * @version 1.0.0
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { router } from './routes/router.js';
import { Queue } from 'bullmq';
import { createClient } from 'redis';
import 'dotenv/config';

const PORT = process.env.PORT || 4000;
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const main = async () => {
  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(helmet());

  // Init Redis och BullMQ
  const redisConnection = createClient({ url: REDIS_URL });
  await redisConnection.connect();
  app.locals.episodeQueue = new Queue('episodeQueue', { connection: redisConnection });

  app.use('/', router);

  // Error handler
  app.use((err, req, res, next) => {
    if (err.status === 500) return res.status(500).send('Internal Server Error...');
    return res.status(err.status || 500).send(err.message);
  });

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Press Ctrl-C to terminate...');
  });
};

main().catch(console.error);