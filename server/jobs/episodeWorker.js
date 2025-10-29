/**
 * Worker that generates episodes using AI.
 * Hugging Face → text
 * Stability AI → image
 * ElevenLabs → audio
 */

import 'dotenv/config';
import { Worker } from 'bullmq';
import axios from 'axios';
import FormData from 'form-data';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API keys (läggs in i .env)
const HF_API_KEY = process.env.HF_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

console.log('Worker started and waiting for jobs...');

const worker = new Worker(
  'episodeQueue',
  async (job) => {
    const { prompt } = job.data;
    console.log(`New job received: ${prompt}`);

    // 1️⃣ Generate text
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

async function generateScriptFromHuggingFace(prompt) {
  console.log('Generating script using Hugging Face...');
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: `Create a short creative story in 3 short scenes about: ${prompt}`,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('⚠️ Hugging Face request failed, using fallback.\n', text);
      return `Scene 1: ${prompt} introduction.\nScene 2: something unexpected.\nScene 3: resolution.`;
    }

    const data = await response.json();

    // Hugging Face ibland returnerar text direkt eller som .generated_text
    const output =
      data.generated_text ||
      data[0]?.generated_text ||
      JSON.stringify(data);

    console.log('✅ Script generated.');
    return output;
  } catch (err) {
    console.error('⚠️ Error contacting Hugging Face:', err.message);
    return `Scene 1: ${prompt} intro.\nScene 2: conflict.\nScene 3: ending.`;
  }
}


/* 🎨 Stability AI image generation */
async function generateImage(prompt) {
  console.log('Generating image...');
  try {
    const form = new FormData();
    form.append('prompt', prompt);

    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${STABILITY_API_KEY}`,
        },
      }
    );

    const image = `data:image/png;base64,${response.data.image_base64}`;
    console.log('✅ Image generated.');
    return image;
  } catch (err) {
    console.error('⚠️ Image generation failed, using placeholder.', err.message);
    return 'https://placehold.co/600x400?text=AI+Image+Placeholder';
  }
}

/* 🔊 ElevenLabs voice generation */
async function generateVoice(text) {
  console.log('Generating voice...');
  try {
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB', // byt till ditt voice_id om du vill
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
    console.log('✅ Voice generated.');
    return `data:audio/mpeg;base64,${audioBase64}`;
  } catch (err) {
    console.error('⚠️ Voice generation failed, skipping audio.', err.message);
    return null;
  }
}

worker.on('failed', (job, err) => {
  console.error(`Job failed: ${err.message}`);
});
