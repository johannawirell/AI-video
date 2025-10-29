/**
 * Worker that generates episodes using AI.
 * Uses Hugging Face for text generation (instead of OpenAI),
 * Stability AI for images, and ElevenLabs for audio.
 */

import 'dotenv/config';
import { Worker } from 'bullmq';
import axios from 'axios';
import { fileURLToPath } from 'url';
import path from 'path';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API keys
const HF_API_KEY = process.env.HF_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

console.log('Worker started and waiting for jobs...');

const worker = new Worker(
  'episodeQueue',
  async (job) => {
    const { prompt } = job.data;
    console.log(`New job received: ${prompt}`);

    // 1️⃣ Generate script text using Hugging Face
    const script = await generateScriptFromHuggingFace(prompt);

    // 2️⃣ Split into scenes
    const scenes = script
      .split(/\n|Scene\s+\d+[:.-]/i)
      .filter((s) => s.trim().length > 0)
      .map((desc) => ({
        description: desc.trim(),
        image: null,
        audio: null,
      }));

    // 3️⃣ Generate image + audio per scene
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      job.updateProgress(Math.round((i / scenes.length) * 100));

      try {
        const image = await generateImage(scene.description);
        scene.image = image;

        const audio = await generateVoice(scene.description);
        scene.audio = audio;
      } catch (err) {
        console.error('Error generating scene:', err.message);
      }
    }

    job.updateProgress(100);
    return { title: `AI Show: ${prompt}`, scenes };
  },
  {
    connection: {
      host: '127.0.0.1',
      port: 6379,
      maxRetriesPerRequest: null,
    },
  }
);

/**
 * Generate script using Hugging Face with fallback.
 */
async function generateScriptFromHuggingFace(prompt) {
  console.log('Generating script using Hugging Face...');
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: `Write a creative short TV show outline with 3 cinematic scenes about: ${prompt}`,
          parameters: { max_new_tokens: 400, temperature: 0.8 },
        }),
      }
    );

    if (!response.ok) {
      console.warn('⚠️ Hugging Face request failed, using fallback text.');
      return `
        Scene 1: In a glowing studio, Johanna tests her AI camera.
        Scene 2: The code hums, and a digital world appears.
        Scene 3: The AI learns to dream in colors.
      `;
    }

    const data = await response.json();
    const output =
      data[0]?.generated_text ||
      'Scene 1: A mysterious AI awakens inside a Swedish developer’s laptop.';
    console.log('Script generated.');
    return output;
  } catch (err) {
    console.error('Error contacting Hugging Face, fallback activated:', err.message);
    return `
      Scene 1: In a glowing studio, Johanna tests her AI camera.
      Scene 2: The code hums, and a digital world appears.
      Scene 3: The AI learns to dream in colors.
    `;
  }
}

/**
 * Generate image using Stability AI.
 */
async function generateImage(prompt) {
  console.log('Generating image...');
  try {
    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      {
        prompt,
        output_format: 'png',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: 'application/json',
        },
      }
    );

    const image = `data:image/png;base64,${response.data.image_base64}`;
    console.log('Image generated.');
    return image;
  } catch (err) {
    console.warn('⚠️ Image generation failed, using placeholder.');
    return 'https://placehold.co/600x400?text=AI+Image+Placeholder';
  }
}

/**
 * Generate speech using ElevenLabs.
 */
async function generateVoice(text) {
  console.log('Generating voice...');
  try {
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/text-to-speech/exAVQeAWzVH1dJy1Mu7T',
      { text },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    const audioBase64 = Buffer.from(response.data, 'binary').toString('base64');
    console.log('Voice generated.');
    return `data:audio/mpeg;base64,${audioBase64}`;
  } catch (err) {
    console.warn('⚠️ Voice generation failed, skipping audio.');
    return null;
  }
}

worker.on('failed', (job, err) => {
  console.error(`Job failed: ${err.message}`);
});
