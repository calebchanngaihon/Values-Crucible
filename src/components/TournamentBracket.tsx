import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ValueNode } from '../types';
import { RotateCcw } from 'lucide-react';
import { getPoleImageSrc } from '../constants';

interface TournamentBracketProps {
  pair: [ValueNode, ValueNode];
  onSelect: (winnerId: string, loserId: string) => void;
  onUndo: () => void;
  index: number;
  total: number;
  canUndo: boolean;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ 
  pair, 
  onSelect, 
  onUndo,
  index, 
  total,
  canUndo
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [heldId, setHeldId] = useState<string | null>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [valA, valB] = pair;

  const getPoleName = (pole: number) => {
    const names: Record<number, string> = {
      1: 'Self-Direction',
      2: 'Stimulation',
      3: 'Hedonism',
      4: 'Achievement',
      5: 'Power',
      6: 'Security',
      7: 'Conformity',
      8: 'Tradition',
      9: 'Benevolence',
      10: 'Universalism'
    };
    return names[pole] || 'Unknown';
  };

  const handleSelect = (winnerId: string, loserId: string) => {
    if (isProcessing) return;
    const now = Date.now();
    const duration = now - lastClickTime;

    if (duration < 1000) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onSelect(winnerId, loserId);
        setLastClickTime(Date.now());
      }, 400);
    } else {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onSelect(winnerId, loserId);
        setLastClickTime(now);
      }, 200); // Small feedback delay
    }
  };

  const handlePointerDown = (id: string, winnerId: string, loserId: string) => {
    if (isProcessing) return;
    setHeldId(id);
    holdTimerRef.current = setTimeout(() => {
      setHeldId(null);
      handleSelect(winnerId, loserId);
    }, 600);
  };

  const handlePointerUpOrLeave = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHeldId(null);
  };

  useEffect(() => {
     setLastClickTime(Date.now());
  }, [pair]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isProcessing || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
      if (e.key === 'ArrowLeft') {
        if (valA && valB) handleSelect(valA.id, valB.id);
      } else if (e.key === 'ArrowRight') {
        if (valA && valB) handleSelect(valB.id, valA.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [valA?.id, valB?.id, pair, isProcessing]);

  return (
    <div className="absolute inset-0 flex flex-col md:flex-row overflow-hidden bg-zinc-950">
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xl px-6"
          >
            <div className="text-center w-full max-w-xs">
              <div className="w-full h-1 bg-zinc-900 mx-auto mb-6 overflow-hidden rounded-full">
                <motion.div 
                  className="h-full bg-blue-600"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              <p className="font-mono text-[9px] md:text-[10px] text-zinc-400 uppercase tracking-[0.3em]">
                Resolving Internal Tension...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-6 md:top-10 left-1/2 -translate-x-1/2 z-20 text-center w-full max-w-md px-6">
        <p className="text-[9px] md:text-[10px] font-mono text-zinc-600 uppercase tracking-widest leading-relaxed">
          Press and hold to lock choice <br className="md:hidden" />and sacrifice alternative
        </p>
      </div>

      {/* Value A */}
      <motion.button
        onPointerDown={(e) => {
           if (e.pointerType === 'mouse' && e.button !== 0) return;
           if (valA && valB) handlePointerDown(valA.id, valA.id, valB.id);
        }}
        onPointerUp={handlePointerUpOrLeave}
        onPointerLeave={handlePointerUpOrLeave}
        onPointerCancel={handlePointerUpOrLeave}
        onContextMenu={(e) => e.preventDefault()}
        className={`flex-1 relative flex flex-col items-center justify-center p-8 md:p-12 text-center focus:outline-none min-h-[35vh] md:min-h-0 w-full overflow-hidden ${
          !heldId ? 'hover:bg-zinc-900 group' : ''
        } ${heldId && heldId !== valA?.id ? 'border-2 border-dashed border-zinc-800' : 'border-2 border-transparent'}`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ 
           x: 0, 
           opacity: heldId && heldId !== valA?.id ? 0.3 : 1,
           filter: heldId && heldId !== valA?.id ? 'blur(4px)' : 'blur(0px)'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {/* Card Image Background */}
        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none transition-opacity group-hover:opacity-60">
            <img 
              src={getPoleImageSrc(valA?.pole || 1)}
              alt={valA?.label || ''} 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-900/60 to-zinc-950/80" />
        </div>

        {heldId === valA?.id && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: "linear" }}
            style={{ originX: 0 }}
            className="absolute top-0 left-0 h-1.5 md:h-2 bg-blue-600 w-full z-10"
          />
        )}
        <div className="mb-3 md:mb-4 font-mono text-[9px] md:text-[10px] text-zinc-400 uppercase tracking-widest group-hover:text-zinc-300 transition-colors z-10 drop-shadow-md">
           {getPoleName(valA?.pole || 0)}
        </div>
        <h2 className={`font-bold mb-4 md:mb-8 tracking-tighter text-zinc-100 break-words w-full px-4 overflow-hidden leading-[1.1] transition-transform z-10 drop-shadow-lg flex items-center justify-center ${heldId === valA?.id ? 'scale-95 text-blue-400' : ''} ${
            (valA?.label?.length || 0) > 12 ? 'text-3xl sm:text-4xl md:text-5xl lg:text-5xl' : 'text-4xl md:text-5xl lg:text-6xl'
        }`}>
          <span className="whitespace-pre-wrap pb-1 text-center max-w-[90%]">
             {valA?.label?.includes(' ') && valA.label.length > 12 ? valA.label : valA?.label}
          </span>
        </h2>
        <div className="max-w-[240px] md:max-w-xs text-zinc-300 text-xs md:text-sm leading-relaxed group-hover:text-zinc-200 transition-colors h-16 flex items-center justify-center z-10 drop-shadow-md font-medium">
            <AnimatePresence mode="wait">
                <motion.p
                   key={heldId && heldId !== valA?.id ? 'sacrifice' : 'normal'}
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -5 }}
                   transition={{ duration: 0.2 }}
                >
                    {heldId && heldId !== valA?.id ? `Sacrificing ${valA?.label}...` : valA?.simpleDefinition}
                </motion.p>
            </AnimatePresence>
        </div>
      </motion.button>

      {/* Divider */}
      <div className="md:w-[1px] md:h-full h-[1px] w-full bg-zinc-900 pointer-events-none z-30" />

      {/* VS Badge */}
      <motion.div 
        animate={{ scale: [1, 1.15, 1], boxShadow: ["0 0 15px rgba(59,130,246,0.3)", "0 0 30px rgba(59,130,246,0.8)", "0 0 15px rgba(59,130,246,0.3)"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 px-4 md:px-5 py-1.5 md:py-2 font-mono text-[10px] md:text-xs font-black text-white uppercase tracking-widest rounded z-30 pointer-events-none"
      >
        VS
      </motion.div>

      {/* Value B */}
      <motion.button
        onPointerDown={(e) => {
           if (e.pointerType === 'mouse' && e.button !== 0) return;
           if (valA && valB) handlePointerDown(valB.id, valB.id, valA.id);
        }}
        onPointerUp={handlePointerUpOrLeave}
        onPointerLeave={handlePointerUpOrLeave}
        onPointerCancel={handlePointerUpOrLeave}
        onContextMenu={(e) => e.preventDefault()}
        className={`flex-1 relative flex flex-col items-center justify-center p-8 md:p-12 text-center focus:outline-none min-h-[35vh] md:min-h-0 w-full overflow-hidden ${
          !heldId ? 'hover:bg-zinc-900 group' : ''
        } ${heldId && heldId !== valB?.id ? 'border-2 border-dashed border-zinc-800' : 'border-2 border-transparent'}`}
        initial={{ x: 100, opacity: 0 }}
        animate={{ 
           x: 0, 
           opacity: heldId && heldId !== valB?.id ? 0.3 : 1,
           filter: heldId && heldId !== valB?.id ? 'blur(4px)' : 'blur(0px)'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {/* Card Image Background */}
        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none transition-opacity group-hover:opacity-60">
            <img 
              src={getPoleImageSrc(valB?.pole || 1)}
              alt={valB?.label || ''} 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-900/60 to-zinc-950/80" />
        </div>

        {heldId === valB?.id && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: "linear" }}
            style={{ originX: 0 }}
            className="absolute top-0 left-0 h-1.5 md:h-2 bg-blue-600 w-full z-10"
          />
        )}
        <div className="mb-3 md:mb-4 font-mono text-[9px] md:text-[10px] text-zinc-400 uppercase tracking-widest group-hover:text-zinc-300 transition-colors z-10 drop-shadow-md">
           {getPoleName(valB?.pole || 0)}
        </div>
        <h2 className={`font-bold mb-4 md:mb-8 tracking-tighter text-zinc-100 break-words w-full px-4 overflow-hidden leading-[1.1] transition-transform z-10 drop-shadow-lg flex items-center justify-center ${heldId === valB?.id ? 'scale-95 text-blue-400' : ''} ${
            (valB?.label?.length || 0) > 12 ? 'text-3xl sm:text-4xl md:text-5xl lg:text-5xl' : 'text-4xl md:text-5xl lg:text-6xl'
        }`}>
          <span className="whitespace-pre-wrap pb-1 text-center max-w-[90%]">
             {valB?.label?.includes(' ') && valB.label.length > 12 ? valB.label : valB?.label}
          </span>
        </h2>
        <div className="max-w-[240px] md:max-w-xs text-zinc-300 text-xs md:text-sm leading-relaxed group-hover:text-zinc-200 transition-colors h-16 flex items-center justify-center z-10 drop-shadow-md font-medium">
            <AnimatePresence mode="wait">
                <motion.p
                   key={heldId && heldId !== valB?.id ? 'sacrifice' : 'normal'}
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -5 }}
                   transition={{ duration: 0.2 }}
                >
                    {heldId && heldId !== valB?.id ? `Sacrificing ${valB?.label}...` : valB?.simpleDefinition}
                </motion.p>
            </AnimatePresence>
        </div>
      </motion.button>

      <div className="absolute top-1/2 -translate-y-1/2 md:translate-y-0 md:top-auto md:bottom-10 bottom-auto left-1/2 -translate-x-1/2 flex flex-row md:flex-col items-center gap-4 z-40 bg-zinc-950/80 px-6 py-3 rounded-full backdrop-blur-md border border-zinc-800 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <div className="font-mono text-xs md:text-sm text-zinc-300 uppercase tracking-[0.2em] whitespace-nowrap font-bold">
          {index + 1} / {total}
        </div>

        <AnimatePresence>
          {canUndo && !isProcessing && (
             <motion.button
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               onClick={onUndo}
               className="flex items-center gap-2 font-mono text-xs md:text-sm text-zinc-100 uppercase tracking-widest hover:text-white hover:bg-zinc-800 bg-zinc-900 border border-zinc-700 px-4 py-1.5 rounded-full transition-colors group font-bold"
             >
               <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-transform" /> Undo
             </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
