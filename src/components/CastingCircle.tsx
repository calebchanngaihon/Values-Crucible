import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { ValueNode } from '../types';
import { Shield, Sparkles } from 'lucide-react';

interface CastingCircleProps {
  finalists: ValueNode[];
  onComplete: (topThree: string[]) => void;
}

export const CastingCircle: React.FC<CastingCircleProps> = ({ finalists, onComplete }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredValue, setHoveredValue] = useState<ValueNode | null>(null);
  const [isSealing, setIsSealing] = useState(false);
  const [radius, setRadius] = useState(240);
  const containerRef = useRef<HTMLDivElement>(null);

  const getPoleName = (pole: number) => {
    const names: Record<number, string> = {
      1: 'Self-Direction', 2: 'Stimulation', 3: 'Hedonism', 4: 'Achievement', 5: 'Power',
      6: 'Security', 7: 'Conformity', 8: 'Tradition', 9: 'Benevolence', 10: 'Universalism'
    };
    return names[pole] || 'Unknown';
  };

  useEffect(() => {
    const updateRadius = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const availableHeight = height - 120;
      const minDimension = Math.min(width, availableHeight);
      
      if (width < 640) {
        setRadius(Math.max(100, Math.min(minDimension / 2 - 60, 140)));
      } else if (width < 1024) {
        setRadius(Math.max(120, Math.min(minDimension / 2 - 80, 180)));
      } else {
        setRadius(Math.max(140, Math.min(minDimension / 2 - 100, 220)));
      }
    };
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  const toggleValue = (id: string) => {
    if (isSealing) return;
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else if (selectedIds.length < 3) {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleFinalize = () => {
    if (selectedIds.length === 3 && !isSealing) {
      setIsSealing(true);
      // Faster transition
      setTimeout(() => {
        onComplete(selectedIds);
      }, 1000);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-zinc-950 overflow-hidden" ref={containerRef}>
      {/* Top Header Pattern */}
      <div className="shrink-0 w-full h-14 md:h-16 border-b border-zinc-900 flex items-center justify-center font-mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-zinc-500 z-50 px-4 bg-zinc-950">
        <div className="flex items-center gap-2">
          <span className="text-blue-500 font-bold">Stage 3</span>
          <div className="w-1 h-1 bg-zinc-800 rounded-full" />
          <span className="text-zinc-600 truncate text-center">Select your final 3 guiding values</span>
        </div>
      </div>

      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="flex-1 w-full flex items-center justify-center z-10 p-4 min-h-0">
        <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center scale-90 sm:scale-100">
          <div className="relative w-32 h-32 md:w-40 md:h-40 border border-zinc-900 rounded-full flex flex-col items-center justify-center bg-zinc-950/50 backdrop-blur-sm group z-30 shadow-2xl">
            <div className={`absolute inset-[-4px] rounded-full border border-zinc-900 transition-all duration-700 ${selectedIds.length === 3 ? 'border-blue-500/50 scale-110' : ''}`} />
            
            <AnimatePresence mode="wait">
              {selectedIds.length === 3 && !isSealing ? (
                <motion.button
                  key="seal"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFinalize();
                  }}
                  className="flex flex-col items-center justify-center group/btn relative z-50 pointer-events-auto cursor-pointer"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] group-hover/btn:bg-blue-500 transition-colors">
                    <Shield className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <span className="mt-2 font-mono text-[8px] md:text-[10px] text-blue-500 uppercase tracking-widest font-bold">Seal Values</span>
                </motion.button>
              ) : (
                <div className="flex flex-col items-center justify-center" key="count">
                  <Shield className="w-6 h-6 md:w-8 md:h-8 text-zinc-800 mb-2" />
                  <div className="font-mono text-[10px] md:text-xs text-blue-500 uppercase tracking-widest text-center px-4 font-bold">
                    {selectedIds.length} / 3
                  </div>
                  <div className="font-mono text-[8px] md:text-[9px] text-zinc-600 uppercase tracking-widest text-center px-4 mt-1">
                    Selected
                  </div>
                </div>
              )}
            </AnimatePresence>

            {isSealing && (
              <motion.div 
                 initial={{ scale: 0 }}
                 animate={{ scale: 2, opacity: 0 }}
                 transition={{ duration: 1.5 }}
                 className="absolute inset-0 bg-blue-600 rounded-full blur-[40px]"
              />
            )}
          </div>

          {finalists.map((v, i) => {
            const angle = (i / finalists.length) * Math.PI * 2 - Math.PI / 2;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            const isSelected = selectedIds.includes(v.id);
            const isHovered = hoveredValue?.id === v.id;

            return (
              <motion.div
                key={v.id}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={isSealing && isSelected ? { 
                  x: 0, y: 0, scale: 0, opacity: 0 
                } : { x, y, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 50, damping: 15, delay: i * 0.05 }}
                className={`absolute top-1/2 left-1/2 z-10 ${isSealing && !isSelected ? 'pointer-events-none' : ''} ${isHovered ? 'z-40' : ''}`}
              >
                <div className="relative -ml-12 -mt-12 md:-ml-14 md:-mt-14 w-24 h-24 md:w-28 md:h-28">
                  <AnimatePresence>
                    {isHovered && !isSealing && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 p-3 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl pointer-events-none hidden md:block z-50 text-center"
                      >
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900 border-b border-r border-zinc-800 rotate-45" />
                        <div className="relative z-10">
                          <div className="font-mono text-[9px] text-blue-500 uppercase tracking-widest mb-1">[{getPoleName(v.pole)}]</div>
                          <div className="font-bold text-zinc-100 mb-1 leading-tight">{v.label}</div>
                          <div className="text-[10px] text-zinc-400 leading-relaxed italic">"{v.simpleDefinition}"</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleValue(v.id);
                    }}
                    onMouseEnter={() => !isSealing && setHoveredValue(v)}
                    onMouseLeave={() => setHoveredValue(null)}
                    className={`w-full h-full rounded-full border flex flex-col items-center justify-center p-3 transition-all duration-500 cursor-pointer ${
                      isSelected 
                      ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] scale-110 z-20' 
                      : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800 hover:text-zinc-300 hover:scale-105'
                    } ${isSealing && !isSelected ? 'opacity-0 scale-0 pointer-events-none' : ''}`}
                  >
                    <span className={`font-bold text-center tracking-tight leading-tight uppercase select-none ${
                      v.label.length > 12 ? 'text-[7px] md:text-[9px] break-words hyphen-auto' : 'text-[9px] md:text-[11px]'
                    }`}>
                      {v.label}
                    </span>
                    {isSelected && <Sparkles className="w-2 h-2 md:w-3 md:h-3 mt-1 text-white animate-pulse shrink-0" />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>


      <AnimatePresence>
      </AnimatePresence>
    </div>
  );
};
