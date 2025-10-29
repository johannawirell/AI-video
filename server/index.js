require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // vi skickar ibland mycket data

const PORT = process.env.PORT || 4000;

/**
 * Hjälprutiner: ersätt med riktiga klienter för dina AI-tjänster.
 * Här använder vi axios mot hypotetiska endpoints.
 */

// 1) Generera manus / episodstruktur (LLM)
app.post('/api/generate-script', async (req, res) => {
  try {
    const { prompt, length = 'short' } = req.body;
    // Exempel med OpenAI GPT-API (ersätt efter din klient)
    const openaiResp = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-5-mini', // byt mot vad du använder
      messages: [
        { role: 'system', content: 'You are an assistant that writes TV episode scripts. Output JSON with scenes array.' },
        { role: 'user', content: `Write a ${length} episode based on: ${prompt}. Return JSON: {title, scenes:[{id, description, dialogue:[{character, text}]}]}` }
      ],
      max_tokens: 1000
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // För enkelhet: vi antar att ngt i openaiResp.data.choices[0].message.content är JSON
    const content = openaiResp.data.choices[0].message.content;
    let json;
    try {
      json = JSON.parse(content);
    } catch (e) {
      // fallback: return som text
      return res.json({ raw: content });
    }
    return res.json(json);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Could not generate script', details: err.response?.data || err.message });
  }
});

// 2) Generera bild per scen eller karaktär
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, width = 1024, height = 576 } = req.body;
    // Exempel mot hypotetisk image API (ersätt med DALL-E / Stability / SDXL)
    const imgResp = await axios.post('https://api.example-image.com/v1/generate', {
      prompt,
      width, height,
      // andra optioner...
    }, {
      headers: { Authorization: `Bearer ${process.env.IMAGE_API_KEY}` },
      responseType: 'arraybuffer'
    });

    // Spara temporärt och returnera URL (i produktion -> S3/Cloud storage)
    const filename = `img_${Date.now()}.png`;
    const outPath = path.join(__dirname, 'public', filename);
    fs.writeFileSync(outPath, Buffer.from(imgResp.data, 'binary'));
    const url = `${req.protocol}://${req.get('host')}/${filename}`;
    res.json({ url });
  } catch (err) {
    console.error(err.message || err);
    res.status(500).json({ error: 'Image generation failed', details: err.message });
  }
});

// 3) Generera röst (TTS) för en text
app.post('/api/generate-voice', async (req, res) => {
  try {
    const { text, voice = 'default' } = req.body;
    // Exempel mot ElevenLabs eller annat
    const ttsResp = await axios.post('https://api.elevenlabs.io/v1/text-to-speech/default', { text }, {
      headers: {
        'Authorization': `Bearer ${process.env.VOICE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    });

    const filename = `tts_${Date.now()}.mp3`;
    const outPath = path.join(__dirname, 'public', filename');
    fs.writeFileSync(outPath, Buffer.from(ttsResp.data, 'binary'));
    const url = `${req.protocol}://${req.get('host')}/${filename}`;
    res.json({ url });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Voice generation failed', details: err.message || err.response?.data || err.message });
  }
});

// 4) Enkel orchestration: generera script -> bilder -> röster -> returnera "episode" metadata
app.post('/api/generate-episode', async (req, res) => {
  try {
    const { prompt } = req.body;
    // 1) script
    const scriptResp = await axios.post(`http://localhost:${PORT}/api/generate-script`, { prompt });
    const script = scriptResp.data;
    // 2) för varje scen generera bild + tts för varje dialograd (enkel, sekventiell)
    const scenesOut = [];
    for (const scene of script.scenes || []) {
      // bild för scene.description
      const imgResp = await axios.post(`http://localhost:${PORT}/api/generate-image`, { prompt: scene.description });
      const imgUrl = imgResp.data.url;

      // generera en enda TTS för hela scenens dialog (concat)
      const dialogText = (scene.dialogue || []).map(d => `${d.character}: ${d.text}`).join('\n');
      const ttsResp = await axios.post(`http://localhost:${PORT}/api/generate-voice`, { text: dialogText });

      scenesOut.push({
        id: scene.id,
        description: scene.description,
        image: imgUrl,
        audio: ttsResp.data.url,
        dialogue: scene.dialogue
      });
    }

    const episode = { title: script.title || 'Untitled', scenes: scenesOut };
    res.json(episode);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Episode generation failed', details: err.response?.data || err.message });
  }
});

// Serve public files (images/tts) - i produktion använd cloud storage
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`AI Show backend listening on http://localhost:${PORT}`);
});
