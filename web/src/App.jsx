import EpisodeForm from './components/EpisodeForm';

export default function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-background text-textMain">
      <div className="w-full max-w-4xl bg-surface border border-border rounded-2xl shadow-glow p-8 sm:p-12 animate-fadeIn">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-4 bg-gradient-to-r from-accent to-accentHover bg-clip-text text-transparent">
          🎬 AI Series Creator
        </h1>
        <p className="text-center text-textSubtle mb-8">
          Beskriv din idé — AI skapar en seriepilot med scener, bilder och röster.
        </p>

        <EpisodeForm />
      </div>

      <footer className="mt-10 text-textSubtle text-sm">
        © {new Date().getFullYear()} Johanna Wirell · Crafted with <span className="text-accent">♥</span>
      </footer>
    </div>
  );
}
