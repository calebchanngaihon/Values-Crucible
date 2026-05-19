import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  progress?: number;
  stageTitle?: string;
  onOpenTheory?: () => void;
  onResetGlobal?: () => void;
  onResetStage?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, progress, stageTitle, onOpenTheory, onResetGlobal, onResetStage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="h-[100dvh] bg-zinc-950 text-zinc-50 flex flex-col font-sans overflow-hidden">
      <audio 
        ref={audioRef} 
        src="https://upload.wikimedia.org/wikipedia/commons/9/90/Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg" 
        loop
        preload="auto"
        crossOrigin="anonymous"
      />
      <header className="shrink-0 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 h-16 flex items-center px-6 justify-between relative z-50">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
          <span className="font-mono text-xs font-bold tracking-widest uppercase truncate max-w-[80px] md:max-w-none">VCrucible</span>
        </div>
        
        {stageTitle && (
          <div className="absolute left-1/2 -translate-x-1/2 font-mono text-[10px] text-zinc-500 uppercase tracking-widest hidden md:block pointer-events-none">
            {stageTitle}
          </div>
        )}

        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={toggleMusic}
            className="flex items-center justify-center p-2 rounded-full hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-blue-400 group"
          >
            {isPlaying ? (
              <Volume2 className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />
            ) : (
              <VolumeX className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />
            )}
          </button>

          <div className="flex items-center gap-2 md:gap-4 mr-2 md:mr-0">
            {onResetStage && (
              <button 
                onClick={onResetStage}
                className="text-[9px] font-mono text-zinc-500 hover:text-orange-500 transition-colors uppercase tracking-widest"
              >
                Reset Stage
              </button>
            )}
            {onResetGlobal && (
              <button 
                onClick={onResetGlobal}
                className="text-[9px] font-mono text-zinc-500 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                Restart
              </button>
            )}
          </div>

          {onOpenTheory && (
            <button 
              onClick={onOpenTheory}
              className="flex items-center gap-2 group transition-colors hidden sm:flex"
            >
              <div className="w-4 h-4 rounded-full border border-zinc-700 flex items-center justify-center group-hover:border-blue-600 transition-colors">
                <span className="text-[8px] font-bold text-zinc-500 group-hover:text-blue-600">?</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-300 uppercase tracking-widest">Theory</span>
            </button>
          )}
        </div>
      </header>

      {progress !== undefined && (
        <div className="shrink-0 h-[2px] bg-zinc-900 z-50">
          <motion.div 
            className="h-full bg-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          />
        </div>
      )}

      <main className="flex-1 flex flex-col min-h-0 relative z-10 w-full overflow-y-auto overflow-x-hidden">
        {children}
      </main>

      <footer className="shrink-0 p-4 border-t border-zinc-900 text-center bg-zinc-950 z-20">
        <span className="font-mono text-[9px] md:text-[10px] text-zinc-700 uppercase tracking-[0.2em]">
          Values Crucible // Research-Based Values Sort
        </span>
      </footer>
    </div>
  );
};
