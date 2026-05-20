import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { ValueNode } from '../types';
import { X, Check, Inbox, History, ArrowLeft, RotateCcw } from 'lucide-react';
import { getPoleImageSrc } from '../constants';

interface PurgeStackProps {
  currentValue: ValueNode;
  onSelect: (id: string, status: 'resonated' | 'discarded') => void;
  onUndo: (id: string) => void;
  index: number;
  total: number;
  resonated: ValueNode[];
  discarded: ValueNode[];
}

const HistoryItem: React.FC<{ 
  v: ValueNode; 
  isKept: boolean; 
  onUndo: (id: string) => void;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
  getPoleName: (pole: number) => string;
}> = ({ v, isKept, onUndo, onHover, hoveredId, getPoleName }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    onMouseEnter={() => onHover(v.id)}
    onMouseLeave={() => onHover(null)}
    onClick={(e) => {
      e.stopPropagation();
      onUndo(v.id);
    }}
    className={`group relative py-2 px-2 lg:px-3 border rounded-lg text-[10px] md:text-xs cursor-pointer transition-all ${
      isKept 
        ? 'bg-blue-600/5 border-blue-600/20 text-blue-400 hover:bg-blue-600/10' 
        : 'bg-zinc-900/50 border-zinc-800/50 text-zinc-400 hover:bg-zinc-900 hover:border-zinc-700'
    }`}
  >
    <div className="flex items-center justify-between gap-1 overflow-hidden">
      <span className="truncate font-medium">{v.label}</span>
      <RotateCcw className="w-2.5 h-2.5 md:w-3 md:h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
    <AnimatePresence>
      {hoveredId === v.id && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute left-0 right-0 top-full mt-2 z-50 p-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl pointer-events-none"
        >
          <div className="font-bold text-zinc-100 mb-1">{v.label}</div>
          <div className="text-[10px] text-zinc-500 mb-2 font-mono uppercase tracking-widest">{getPoleName(v.pole)}</div>
          <div className="text-[11px] text-zinc-400 leading-relaxed italic">"{v.simpleDefinition}"</div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export const PurgeStack: React.FC<PurgeStackProps> = ({ 
  currentValue, 
  onSelect, 
  onUndo,
  index, 
  total,
  resonated,
  discarded
}) => {
  const [showMobileHistory, setShowMobileHistory] = useState<'none' | 'pruned' | 'kept'>('none');
  const [hoveredHistoricalId, setHoveredHistoricalId] = useState<string | null>(null);
  const remainingCount = total - index;

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const background = useTransform(
    x,
    [-150, 0, 150],
    ['rgba(239, 68, 68, 0.1)', 'rgba(24, 24, 27, 1)', 'rgba(59, 130, 246, 0.1)']
  );

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      onSelect(currentValue.id, 'resonated');
    } else if (info.offset.x < -100) {
      onSelect(currentValue.id, 'discarded');
    }
    x.set(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
      if (e.key === 'ArrowLeft') {
        onSelect(currentValue.id, 'discarded');
      } else if (e.key === 'ArrowRight') {
        onSelect(currentValue.id, 'resonated');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentValue.id, onSelect]);

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

  return (
    <div className="absolute inset-0 flex w-full overflow-hidden bg-zinc-950 flex-col md:flex-row">
      {/* Mobile History View (Top Bar Toggle) */}
      <div className="flex md:hidden w-full h-14 border-b border-zinc-900 px-4 items-center justify-between font-mono text-[9px] uppercase tracking-widest text-zinc-500 overflow-x-auto scrollbar-none gap-4">
        <button 
          onClick={() => setShowMobileHistory('pruned')}
          className="flex items-center gap-1.5 whitespace-nowrap active:opacity-50 transition-opacity"
        >
          <span className="text-zinc-700">Pruned</span>
          <span className="text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded-md min-w-[20px] text-center">{discarded.length}</span>
        </button>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-zinc-400 font-bold">{remainingCount}</span>
          <span className="text-zinc-700">Remaining</span>
        </div>
        <button 
          onClick={() => setShowMobileHistory('kept')}
          className="flex items-center gap-1.5 whitespace-nowrap active:opacity-50 transition-opacity"
        >
          <span className="text-zinc-700">Kept</span>
          <span className={`${resonated.length < 3 ? 'text-blue-500/50' : 'text-blue-500'} bg-blue-600/10 px-1.5 py-0.5 rounded-md min-w-[20px] text-center font-bold`}>
            {resonated.length}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {showMobileHistory !== 'none' && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-zinc-950 md:hidden flex flex-col"
          >
            <div className="h-16 border-b border-zinc-900 flex items-center px-6 justify-between shrink-0">
              <button 
                onClick={() => setShowMobileHistory('none')}
                className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 uppercase tracking-widest"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Crucible
              </button>
              <div className="font-mono text-[10px] text-blue-500 uppercase tracking-[0.2em] font-bold">
                {showMobileHistory === 'kept' ? 'Kept History' : 'Pruned History'}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {(showMobileHistory === 'kept' ? resonated : discarded).slice().reverse().map((v) => (
                <div 
                  key={v.id} 
                  onClick={() => {
                    onUndo(v.id);
                    setShowMobileHistory('none');
                  }}
                  className="p-4 bg-zinc-900/50 border border-zinc-900 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <div className="text-zinc-100 font-bold text-sm mb-1">{v.label}</div>
                    <div className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">{getPoleName(v.pole)}</div>
                  </div>
                  <RotateCcw className="w-4 h-4 text-zinc-700" />
                </div>
              ))}
              {(showMobileHistory === 'kept' ? resonated : discarded).length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-700 font-mono text-[10px] uppercase tracking-widest">
                  <Inbox className="w-8 h-8 mb-4 opacity-20" />
                  No data captured
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="hidden md:flex md:w-40 lg:w-48 xl:w-64 border-r border-zinc-900 flex flex-col md:p-4 lg:p-6 overflow-hidden transition-all">
        <div className="mb-6 flex items-center justify-between shrink-0">
          <h3 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <X className="w-3 h-3" /> <span>Pruned</span>
          </h3>
          <span className="font-mono text-[10px] text-zinc-700">{discarded.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 scrollbar-none">
          {discarded.slice().reverse().map((v) => (
            <HistoryItem 
              key={v.id} 
              v={v} 
              isKept={false} 
              onUndo={onUndo}
              onHover={setHoveredHistoricalId}
              hoveredId={hoveredHistoricalId}
              getPoleName={getPoleName}
            />
          ))}
          {discarded.length === 0 && (
            <div className="text-[10px] text-zinc-800 font-mono italic">No data pruned</div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center min-w-0 h-full relative p-4 md:p-8 pt-6 md:pt-20">
        {/* Top Stats Bar - Desktop Only */}
        <div className="hidden md:flex absolute top-0 left-0 w-full h-16 border-b border-zinc-900 items-center justify-center px-8 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 z-20 bg-zinc-950/50 backdrop-blur-sm relative">
           <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <span className="text-zinc-100 font-bold">{remainingCount}</span>
                <span className="text-zinc-700">Remaining</span>
              </div>
              <div className="w-px h-4 bg-zinc-900" />
              <div className="flex items-center gap-3">
                <span className={`${resonated.length < 3 ? 'text-blue-500/50' : 'text-blue-500'} font-bold`}>{resonated.length}</span>
                <span className="text-zinc-700">Kept</span>
              </div>
           </div>
           <div className="absolute bottom-0 left-0 h-[1px] bg-blue-500/50 transition-all duration-300" style={{ width: `${(index / total) * 100}%` }} />
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden absolute top-0 left-0 w-full h-[2px] bg-zinc-900">
          <div className="h-full bg-blue-500/50 transition-all duration-300" style={{ width: `${(index / total) * 100}%` }} />
        </div>

        <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center min-h-0">
          {resonated.length < 3 && index > 40 && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute top-2 md:top-24 bg-blue-600/10 border border-blue-600/20 px-4 py-2 rounded-full z-30"
            >
              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest font-bold">
                Attention: Surface more signal. Minimum 3 kept values required for compression.
              </span>
            </motion.div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentValue.id}
              style={{ x, rotate, background }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-sm flex-1 max-h-[50vh] min-h-[300px] border border-zinc-700 rounded-[2rem] flex flex-col items-center justify-center p-6 md:p-8 text-center shadow-[0_48px_96px_-12px_rgba(0,0,0,1)] relative z-10 isolate mb-6 md:mb-8 cursor-grab active:cursor-grabbing bg-zinc-900/90 overflow-hidden ring-1 ring-white/10"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.05, opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Swipe Indicators */}
              <motion.div 
                style={{ opacity: useTransform(x, [-100, -50], [1, 0]) }}
                className="absolute top-6 left-6 text-red-500 flex flex-col items-center gap-1"
              >
                <X className="w-6 h-6 md:w-8 md:h-8" />
                <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest">Prune</span>
              </motion.div>
              <motion.div 
                style={{ opacity: useTransform(x, [50, 100], [0, 1]) }}
                className="absolute top-6 right-6 text-blue-500 flex flex-col items-center gap-1"
              >
                <Check className="w-6 h-6 md:w-8 md:h-8" />
                <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest">Keep</span>
              </motion.div>

              <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0">
                <h2 className={`font-bold mb-3 tracking-tighter text-zinc-100 break-words w-full h-auto flex items-center justify-center leading-none z-10 drop-shadow-lg ${
                    (currentValue?.label?.length || 0) > 12 ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl md:text-5xl'
                }`}>
                  <span className="max-w-[90%] mx-auto whitespace-pre-wrap leading-[1.1] pb-1 text-center">
                    {currentValue?.label?.includes(' ') && currentValue.label.length > 12 
                      ? currentValue.label
                      : currentValue?.label
                    }
                  </span>
                </h2>
                <div className="h-px w-6 md:w-8 bg-blue-600/30 mb-3 md:mb-6 shrink-0 z-10" />
                <p className="text-zinc-200 text-[11px] md:text-sm leading-relaxed overflow-y-auto scrollbar-none px-2 text-balance max-h-[120px] font-medium drop-shadow-md z-10">
                  {currentValue?.simpleDefinition}
                </p>
              </div>

              {/* Card Image Background */}
              <div className="absolute inset-0 z-0 opacity-50">
                 <img 
                    src={getPoleImageSrc(currentValue?.pole || 1)}
                    alt={currentValue?.label || ''} 
                    className="w-full h-full object-cover object-center"
                 />
                 {/* Gradient overlay to ensure text readability */}
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/60 to-zinc-950/80" />
              </div>

              <div className="mt-auto pt-4 border-t border-zinc-800/50 w-full shrink-0 relative z-10">
                <div className="font-mono text-[8px] md:text-[10px] text-zinc-600 uppercase tracking-[0.2em]">
                  {getPoleName(currentValue?.pole || 0)}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-3 md:gap-4 w-full max-w-[280px] sm:max-w-sm shrink-0 pb-4 md:pb-0">
            <button
              onClick={() => onSelect(currentValue.id, 'discarded')}
              className="flex-1 h-12 md:h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center gap-2 font-mono text-[10px] md:text-xs uppercase tracking-widest text-zinc-500 hover:bg-zinc-800 hover:border-zinc-700 hover:text-zinc-300 transition-all active:scale-95 group"
            >
              <X className="w-3 h-3 md:w-4 md:h-4 group-hover:text-red-500/50 transition-colors" />
              Prune
            </button>
            <button
              onClick={() => onSelect(currentValue.id, 'resonated')}
              className="flex-1 h-12 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center gap-2 font-mono text-[10px] md:text-xs uppercase tracking-widest text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all active:scale-95 group"
            >
              <Check className="w-3 h-3 md:w-4 md:h-4 group-hover:scale-110 transition-transform" />
              Keep
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Kept History - Hidden on Mobile */}
      <div className="hidden md:flex md:w-40 lg:w-48 xl:w-64 border-l border-zinc-900 flex flex-col md:p-4 lg:p-6 overflow-hidden transition-all">
        <div className="mb-6 flex items-center justify-between shrink-0">
          <h3 className="font-mono text-[10px] text-blue-500 uppercase tracking-widest flex items-center gap-2">
            <Check className="w-3 h-3 text-blue-500" /> <span>Kept</span>
          </h3>
          <span className="font-mono text-[10px] text-zinc-700">{resonated.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 scrollbar-none">
          {resonated.slice().reverse().map((v) => (
            <HistoryItem 
              key={v.id} 
              v={v} 
              isKept={true} 
              onUndo={onUndo}
              onHover={setHoveredHistoricalId}
              hoveredId={hoveredHistoricalId}
              getPoleName={getPoleName}
            />
          ))}
          {resonated.length === 0 && (
            <div className="text-[10px] text-zinc-800 font-mono italic">No values captured</div>
          )}
        </div>
      </div>
    </div>
  );
};

