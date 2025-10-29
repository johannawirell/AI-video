import { Worker } from 'bullmq';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redisConnection = createClient({ url: REDIS_URL });
await redisConnection.connect();

const worker = new Worker('episodeQueue', async job => {
  const { prompt } = job.data;
  console.log(`🎬 Starting episode job for: "${prompt}"`);

  job.updateProgress(10);

  // 1) Generera manus
  const scriptResp = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: 'Write a 3-scene TV episode. Return JSON: { title, scenes: [{ description, dialogue: [{character,text}] }] }' },
        { role: 'user', content: prompt }
      ]
    },
    { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
  );

  const script = JSON.parse(scriptResp.data.choices[0].message.content);
  job.updateProgress(25);

  // 2) Generera bilder + ljud
  const results = await Promise.all(script.scenes.map(async scene => {
    const imgResp = await axios.post(
      'https://api.openai.com/v1/images/generations',
      { model: 'gpt-image-1', prompt: scene.description },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
    );
    const imgUrl = imgResp.data.data[0].url;

    const dialogueText = scene.dialogue.map(d => `${d.character}: ${d.text}`).join('\n');
    const ttsResp = await axios.post(
      'https://api.elevenlabs.io/v1/text-to-speech/default',
      { text: dialogueText },
      { headers: { Authorization: `Bearer ${process.env.VOICE_API_KEY}`, 'Content-Type': 'application/json' }, responseType: 'arraybuffer' }
    );

    const fileName = `${uuidv4()}.mp3`;
    const outPath = path.join('public', fileName);
    fs.writeFileSync(outPath, Buffer.from(ttsResp.data, 'binary'));

    return { description: scene.description, image: imgUrl, audio: `/public/${fileName}` };
  }));

  job.updateProgress(100);
  console.log('✅ Episode complete!');
  return { title: script.title, scenes: results };
}, { connection: redisConnection });
