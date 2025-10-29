import { useState } from 'react';
import axios from 'axios';

export default function EpisodeForm() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('');
  const [, setJobId] = useState(null);
  const [result, setResult] = useState(null);

  const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000/api';

  const startJob = async () => {
    setResult(null);
    setStatus('Startar jobb...');
    try {
      const resp = await axios.post(`${API_BASE}/generate-episode`, { prompt });
      setJobId(resp.data.jobId);
      setStatus('Jobb startat — AI jobbar...');
      pullJob(resp.data.jobId);
    } catch (err) {
      setStatus(`Fel: ${err.message}`);
    }
  };

  const pullJob = async (id) => {
    const interval = setInterval(async () => {
      try {
        const resp = await axios.get(`${API_BASE}/job/${id}`);
        setStatus(`Status: ${resp.data.state} (${resp.data.progress || 0}%)`);
        if (resp.data.state === 'completed') {
          clearInterval(interval);
          setStatus('Färdig!');
          setResult(resp.data.result);
        }
      } catch (err) {
        clearInterval(interval);
        setStatus(`Fel: ${err.message}`);
      }
    }, 2000);
  };

  return (
  <div className="">
    

    <textarea
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      placeholder="Beskriv din serieidé..."
      className="w-full 
                bg-surface/80 
                text-textMain 
                placeholder-textSubtle 
                border 
                border-border 
                rounded-xl p-4 
                mb-6 
                focus:outline-none 
                focus:ring-2 
                focus:ring-accent 
                focus:border-transparent 
                transition-all 
                resize-none"
      rows="4"
    />

    <button
      onClick={startJob}
      disabled={!prompt}
      className=" w-full 
                  bg-accent 
                  text-white 
                  font-semibold 
                  py-3 
                  px-6 
                  rounded-full 
                  cursor-pointer 
                  hover:bg-accentHover 
                  hover:text-white/90 
                  hover:scale-[1.02] 
                  transition-all 
                  duration-300 
                  shadow-md 
                  hover:shadow-accent/40 
                  active:scale-95 
                  disabled:opacity-50 
                  disabled:cursor-not-allowed
                  "
    >Generera avsnitt</button>

    <p className="mt-4 
                  text-textSubtle 
                  text-center"
    >{status}</p>

    {result && (
      <div className="mt-10 space-y-8">
        <h3 className="text-xl font-bold text-accent text-center">{result.title}</h3>

        {result.scenes.map((scene, i) => (
          <div
            key={i}
            className="bg-surface/60 
                       border 
                       border-border 
                       rounded-xl 
                       p-5 
                       transition 
                       hover:border-accent/30"
          >
            <p className="italic text-textSubtle mb-3">{scene.description}</p>

            {scene.image && (
              <img
                src={scene.image}
                alt={`Scen ${i + 1}`}
                className="w-full rounded-lg mb-3"
              />
            )}

            {scene.audio && (
              <audio controls className="w-full">
                <source src={scene.audio} type="audio/mpeg" />
              </audio>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

}
