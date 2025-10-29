/**
 * Module for the EpisodeController.
 *
 * @author Johanna Wirell
 * @version 1.0.0
 */
import 'dotenv/config';

export class EpisodeController {
  async index(req, res) {
    res.send('AI Episode Server is running');
  }

  async generateEpisode(req, res, next) {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: 'Prompt missing' });

      // Lägg till i BullMQ-kön
      const job = await req.app.locals.episodeQueue.add('generate', { prompt });
      res.json({ jobId: job.id, message: 'Episode generation started' });
    } catch (err) {
      next(err);
    }
  }

  async getJob(req, res, next) {
    try {
      const { id } = req.params;
      const job = await req.app.locals.episodeQueue.getJob(id);
      if (!job) return res.status(404).json({ error: 'Job not found' });

      const state = await job.getState();
      const progress = job.progress;
      const result = job.returnvalue;
      res.json({ state, progress, result });
    } catch (err) {
      next(err);
    }
  }
}
