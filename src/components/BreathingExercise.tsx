import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Play } from 'lucide-react';

interface BreathingExerciseProps {
  onComplete: () => void;
}

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onComplete }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!hasStarted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, onComplete]);

  useEffect(() => {
    if (!hasStarted) return;

    let currentPhase: 'Inhale' | 'Hold' | 'Exhale' | 'Pause' = 'Inhale';
    let phaseTimer: any;

    const runPhase = () => {
      if (currentPhase === 'Inhale') {
        setPhase('Inhale');
        setProgress(1);
        phaseTimer = setTimeout(() => {
          currentPhase = 'Hold';
          runPhase();
        }, 4000);
      } else if (currentPhase === 'Hold') {
        setPhase('Hold');
        phaseTimer = setTimeout(() => {
          currentPhase = 'Exhale';
          runPhase();
        }, 4000);
      } else if (currentPhase === 'Exhale') {
        setPhase('Exhale');
        setProgress(0);
        phaseTimer = setTimeout(() => {
          currentPhase = 'Pause';
          runPhase();
        }, 4000);
      } else if (currentPhase === 'Pause') {
        setPhase('Pause');
        phaseTimer = setTimeout(() => {
          currentPhase = 'Inhale';
          runPhase();
        }, 4000);
      }
    };

    runPhase();
    return () => clearTimeout(phaseTimer);
  }, [hasStarted]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 p-8 text-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <motion.div 
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]"
           animate={{ 
             scale: hasStarted ? (phase === 'Inhale' || phase === 'Hold' ? 1.5 : 1) : 1,
             opacity: hasStarted ? (phase === 'Inhale' || phase === 'Hold' ? 0.2 : 0.1) : 0.1
           }}
           transition={{ duration: 4, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-md w-full relative z-10">
        <AnimatePresence mode="wait">
          {!hasStarted ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-8"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center">
                  <Wind className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter text-zinc-100">Harmonizing the Self</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  You have just navigated a series of intense internal conflicts. Before we crystallize your core values, take sixty seconds to reset your nervous system and find clarity through guided breathing.
                </p>
              </div>
              <button
                onClick={() => setHasStarted(true)}
                className="group relative px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-full font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-blue-400 hover:border-blue-500/30 transition-all flex items-center gap-3 mx-auto"
              >
                <Play className="w-3 h-3 fill-current" /> Begin Integration
              </button>
              <button
                onClick={onComplete}
                className="mx-auto block text-[9px] font-mono text-zinc-700 hover:text-zinc-500 transition-colors uppercase tracking-[0.2em]"
              >
                Skip Exercise
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                {/* Visualizer Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-zinc-900"
                  />
                  <motion.circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="753.98"
                    strokeDashoffset={753.98 * (1 - timeLeft / 60)}
                    className="text-blue-500/30"
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>

                {/* Breathing Circle */}
                <motion.div 
                  className="w-32 h-32 rounded-full bg-blue-500/20 border border-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.2)] flex items-center justify-center"
                  animate={{ 
                    scale: phase === 'Inhale' ? 1.8 : phase === 'Hold' ? 1.8 : 1,
                  }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                >
                   <span className="font-mono text-xs uppercase tracking-widest text-blue-400">
                     {phase}
                   </span>
                </motion.div>
              </div>

              <div className="space-y-4">
                <div className="font-mono text-[48px] text-zinc-100 font-light tabular-nums">
                  {timeLeft}
                </div>
                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                  Seconds remaining
                </div>
                <button
                  onClick={onComplete}
                  className="mx-auto block text-[9px] font-mono text-zinc-700 hover:text-zinc-500 transition-colors uppercase tracking-[0.2em] mt-8"
                >
                  Skip Exercise
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
