export default function LoadingSpinner({ text = 'AI genererar din serie...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm animate-fadeIn">
      {/* Pulserande neon-bar */}
      <div className="relative w-64 h-2 bg-surface/50 rounded-full overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-r from-accent via-accentHover to-accent animate-pulsebar" />
      </div>

      {/* Snurrande ring */}
      <div className="mt-8 w-12 h-12 border-4 border-accent/60 border-t-transparent rounded-full animate-spin-slow blur-[0.5px]" />

      {/* Text */}
      <p className="mt-8 text-transparent bg-clip-text bg-gradient-to-r from-accent to-accentHover font-medium tracking-wide text-lg animate-fadeIn text-center">
        {text}
      </p>
    </div>
  );
}
