export default function LoadingSpinner({ text = 'AI genererar din serie...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm animate-fadeIn">
      {/* Snurrande glödande ring */}
      <div className="w-14 h-14 border-4 border-accent/60 border-t-transparent rounded-full animate-spin-slow blur-[0.5px] shadow-[0_0_20px_2px_rgba(139,92,246,0.3)]" />

      {/* Text under ringen */}
      <p className="mt-8 text-transparent bg-clip-text bg-gradient-to-r from-accent to-accentHover font-medium tracking-wide text-lg animate-fadeIn text-center">
        {text}
      </p>
    </div>
  );
}
