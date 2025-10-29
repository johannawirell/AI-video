import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import { Film } from 'lucide-react';

export default function EpisodeForm() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('');
  const [, setJobId] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const jobInterval = useRef(null);

  const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000/api';

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isLoading) handleCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isLoading]);

  const startJob = async () => {
    setResult(null);
    setStatus('Starting AI job...');
    setIsLoading(true);
    try {
      const resp = await axios.post(`${API_BASE}/generate-episode`, { prompt });
      setJobId(resp.data.jobId);
      setStatus('AI is creating scenes, voices and visuals...');
      trackJob(resp.data.jobId);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      setIsLoading(false);
    }
  };

  // renamed from pollJob → trackJob
  const trackJob = async (id) => {
    jobInterval.current = setInterval(async () => {
      try {
        const resp = await axios.get(`${API_BASE}/job/${id}`);
        setStatus(`Status: ${resp.data.state} (${resp.data.progress || 0}%)`);
        if (resp.data.state === 'completed') {
          clearInterval(jobInterval.current);
          jobInterval.current = null;
          setIsLoading(false);
          setStatus('✅ Done!');
          setResult(resp.data.result);
          toast.success('AI generation complete!');
        }
      } catch (err) {
        clearInterval(jobInterval.current);
        jobInterval.current = null;
        setIsLoading(false);
        setStatus(`Error: ${err.message}`);
        toast.error('Something went wrong during generation.');
      }
    }, 2000);
  };

  const handleCancel = () => {
    if (jobInterval.current) {
      clearInterval(jobInterval.current);
      jobInterval.current = null;
    }
    setIsLoading(false);
    setStatus('Generation cancelled.');
    toast('AI generation stopped', { icon: '🛑' });
  };

  return (
    <>
      {isLoading && (
        <LoadingSpinner
          text="AI is generating your episode..."
          onCancel={handleCancel}
        />
      )}

      <div
        className="backdrop-blur-sm bg-surface/80 border border-border 
                   rounded-2xl shadow-lg shadow-accent/10 
                   p-8 w-full max-w-2xl mx-auto transition-all duration-300"
      >
        {/* Header */}
        <div className="text-center mb-10 animate-fadeIn z-10">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Film className="text-accent w-8 h-8" />
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-accentHover">
              AI Video Creator
            </h1>
          </div>
          <p className="mt-2 text-textSubtle text-base md:text-lg">
            Generate cinematic episodes with AI — scenes, images & voiceovers.
          </p>
        </div>

        {/* Prompt input */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your idea..."
          className="w-full bg-surface/70 text-textMain placeholder-textSubtle 
                     border border-border rounded-xl p-4 mb-6
                     focus:outline-none focus:ring-2 focus:ring-accent 
                     focus:border-transparent transition-all resize-none"
          rows="4"
        />

        {/* Generate button */}
        <button
          onClick={startJob}
          disabled={!prompt}
          className="w-full bg-accent text-white font-semibold py-3 px-6 
                     rounded-full cursor-pointer hover:bg-accentHover 
                     hover:scale-[1.02] transition-all duration-300 
                     shadow-md hover:shadow-accent/40 active:scale-95 
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Episode
        </button>

        {/* Status text */}
        <p className="mt-4 text-textSubtle text-center">{status}</p>

        {/* Results */}
        {result && (
          <div className="mt-10 space-y-8">
            <h3 className="text-xl font-bold text-accent text-center">{result.title}</h3>

            {result.scenes.map((scene, i) => (
              <div
                key={i}
                className="bg-surface/60 border border-border rounded-xl p-5 
                           transition hover:border-accent/30"
              >
                <p className="italic text-textSubtle mb-3">{scene.description}</p>

                {scene.image && (
                  <img
                    src={scene.image}
                    alt={`Scene ${i + 1}`}
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
    </>
  );
}
