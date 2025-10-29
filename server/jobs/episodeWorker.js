/**
 * Worker for AI episode generation.
 * Handles the background job queue.
 *
 * Author: Johanna Wirell
 * Version: 1.0.0
 */

import 'dotenv/config';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import OpenAI from 'openai';
import axios from 'axios';

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const worker = new Worker(
  'episodeQueue',
  async (job) => {
    const { prompt } = job.data;
    console.log(`🎬 New job received: ${prompt}`);
    job.updateProgress(10);

    try {
      const scriptResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a creative film screenwriter generating short AI film scripts.' },
          { role: 'user', content: `Create a short 3-scene concept for: ${prompt}` },
        ],
      });
      const script = scriptResponse.choices[0].message.content;
      job.updateProgress(30);

      const images = await Promise.all([
        generateImage(`${prompt}, cinematic lighting, scene 1`),
        generateImage(`${prompt}, cinematic lighting, scene 2`),
        generateImage(`${prompt}, cinematic lighting, scene 3`),
      ]);
      job.updateProgress(60);

      const audios = await Promise.all([
        generateVoice(`Scene one: ${prompt}`),
        generateVoice(`Scene two: ${prompt}`),
        generateVoice(`Scene three: ${prompt}`),
      ]);
      job.updateProgress(90);

      const result = {
        title: `AI Film: ${prompt}`,
        script,
        scenes: images.map((img, i) => ({
          description: `Scene ${i + 1}`,
          image: img,
          audio: audios[i],
        })),
      };

      job.updateProgress(100);
      console.log(`Job complete: ${prompt}`);
      return result;
    } catch (err) {
      console.error('Job failed:', err.message);
      throw err;
    }
  },
  { connection }
);

console.log('Worker started and waiting for jobs...');

// --- Helper functions ---
async function generateImage(prompt) {
  try {
    const resp = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      { prompt, output_format: 'png' },
      { headers: { Authorization: `Bearer ${process.env.STABILITY_API_KEY}` } }
    );
    return resp.data.image || null;
  } catch (err) {
    console.error('🖼️ Image generation failed:', err.message);
    return null;
  }
}

async function generateVoice(text) {
  try {
    const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // ElevenLabs default
    const resp = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      { text },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );
    const base64Audio = Buffer.from(resp.data, 'binary').toString('base64');
    return `data:audio/mpeg;base64,${base64Audio}`;
  } catch (err) {
    console.error('Voice generation failed:', err.message);
    return null;
  }
}
