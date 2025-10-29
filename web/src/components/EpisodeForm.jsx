import { useState } from 'react';
import axios from 'axios';

export default function EpisodeForm() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('');
  const [, setJobId] = useState(null);
  const [result, setResult] = useState(null);

  // ⚙️ ändra till din backend-url vid deploy (Render t.ex.)
  const API_BASE = 'http://localhost:4000/api';

  const startJob = async () => {
    setResult(null);
    setStatus('Startar jobb...');
    try {
      const resp = await axios.post(`${API_BASE}/generate-episode`, { prompt });
      setJobId(resp.data.jobId);
      setStatus('Jobb startat — AI jobbar...');
      pollJob(resp.data.jobId);
    } catch (err) {
      setStatus(`Fel: ${err.message}`);
    }
  };

  const pollJob = async (id) => {
    const interval = setInterval(async () => {
      try {
        const resp = await axios.get(`${API_BASE}/job/${id}`);
        setStatus(`Status: ${resp.data.state} (${resp.data.progress || 0}%)`);
        if (resp.data.state === 'completed') {
          clearInterval(interval);
          setStatus('✅ Färdig!');
          setResult(resp.data.result);
        }
      } catch (err) {
        clearInterval(interval);
        setStatus(`Fel: ${err.message}`);
      }
    }, 2000);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Skriv din idé till en TV-serie..."
        className="w-full border border-gray-300 rounded-md p-3 mb-4 focus:ring-2 focus:ring-blue-400"
        rows="4"
      />
      <button
        onClick={startJob}
        disabled={!prompt}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:bg-gray-300"
      >
        🎥 Generera avsnitt
      </button>

      <p className="mt-4 text-gray-700">{status}</p>

      {result && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">{result.title}</h2>
          {result.scenes.map((scene, i) => (
            <div key={i} className="border border-gray-200 p-4 rounded-lg mb-6">
              <p className="italic text-gray-700 mb-2">{scene.description}</p>
              {scene.image && (
                <img
                  src={scene.image}
                  alt={`Scene ${i + 1}`}
                  className="w-full rounded-md mb-3"
                />
              )}
              {scene.audio && (
                <audio controls className="w-full">
                  <source src={scene.audio} type="audio/mpeg" />
                  Din webbläsare stödjer inte ljuduppspelning.
                </audio>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
