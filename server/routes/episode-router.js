/**
 * The routes.
 *
 * @author Johanna Wirell 
 * @version 1.0.0
 */
import express from 'express';
import { EpisodeController } from '../controllers/episode-controller.js';

export const router = express.Router();
const controller = new EpisodeController();

router.get('/', controller.index.bind(controller));
router.post('/generate-episode', controller.generateEpisode.bind(controller));
router.get('/job/:id', controller.getJob.bind(controller));

