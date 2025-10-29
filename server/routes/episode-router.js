/**
 * The routes.
 *
 * @author Johanna Wirell 
 * @version 1.0.0
 */
import express from 'express';
import { EpisodeController } from '../controllers/episode-controller.js';
export const router = express.Router();

const episodeController = new EpisodeController();

router.get('/', episodeController.index.bind(episodeController));
router.post('/generate-episode', episodeController.generateEpisode.bind(episodeController));
router.get('/job/:id', episodeController.getJob.bind(episodeController));

