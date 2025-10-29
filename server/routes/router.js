/**
 * The routes.
 *
 * @author Johanna Wirell 
 * @version 1.0.0
 */
import express from 'express';
import createError from 'http-errors';
import { router as episodeRouter } from './episode-router.js';

export const router = express.Router();

router.use('/api', episodeRouter);

// Catch-all 404
router.use((req, res, next) => next(createError(404)));

