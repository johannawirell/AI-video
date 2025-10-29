import React from 'react';
import EpisodeForm from './components/EpisodeForm';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          🎬 AI Series Creator
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Skriv en idé — få en AI-genererad seriepilot med scener, bilder och röster.
        </p>
        <EpisodeForm />
      </div>
    </div>
  );
}
