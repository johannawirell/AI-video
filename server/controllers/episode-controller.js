/**
 * Module for the EpisodeController.
 *
 * @author Johanna Wirell
 * @version 1.0.0
 */

/**
 * Encapsulates a controller.
 */import 'dotenv/config';

export class EpisodeController {
  async index(req, res) {
    res.send('AI Episode server is running!');
  }

  async generateEpisode(req, res) {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt missing' });

    // Skapa jobb i BullMQ
    const job = await req.app.locals.episodeQueue.add('generate', { prompt });
    res.json({ jobId: job.id, message: 'Episode generation started' });
  }

  async getJob(req, res) {
    const { id } = req.params;
    const job = await req.app.locals.episodeQueue.getJob(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;
    res.json({ state, progress, result });
  }
}
