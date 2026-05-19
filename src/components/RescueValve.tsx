import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ValueNode } from '../types';
import { RotateCcw } from 'lucide-react';

interface RescueValveProps {
  discardedValues: ValueNode[];
  resonatedCount: number;
  rescuedCount: number;
  onRescue: (id: string) => void;
  onProceed: () => void;
  onRestart: () => void;
}

export const RescueValve: React.FC<RescueValveProps> = ({ 
  discardedValues, 
  resonatedCount, 
  rescuedCount, 
  onRescue, 
  onProceed,
  onRestart
}) => {
  const fastestDiscarded = useMemo(() => {
    return [...discardedValues]
      .sort((a, b) => (a.purgeTimeMs || 999999) - (b.purgeTimeMs || 999999))
      .slice(0, 12);
  }, [discardedValues]);

  const canProceed = resonatedCount >= 3;

  return (
    <div className="flex-1 flex flex-col p-8 max-w-4xl mx-auto w-full">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold mb-4 tracking-tight uppercase">The Rescue Valve</h2>
        <p className="text-zinc-500 text-sm max-w-md mx-auto">
          Review these pruned values. Did you dismiss something vital too quickly? 
          You can rescue up to <span className="text-blue-500">{3 - rescuedCount} more</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
        {fastestDiscarded.map((v, i) => {
          const isResonated = v.status === 'resonated';
          return (
            <motion.button
              key={v.id}
              onClick={() => !isResonated && rescuedCount < 3 && onRescue(v.id)}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                isResonated 
                ? 'bg-blue-600/10 border-blue-600 text-blue-500 cursor-default' 
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <h3 className="font-bold text-sm mb-1">{v.label}</h3>
              <p className="text-[10px] text-zinc-500 line-clamp-2 leading-tight">
                {v.simpleDefinition}
              </p>
              {isResonated && (
                 <RotateCcw className="absolute top-2 right-2 w-3 h-3" />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col items-center gap-6 pb-12">
        {!canProceed ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-500/80 font-mono text-[10px] uppercase tracking-widest text-center">
              Selection Incomplete: Minimum 3 kept values required to proceed.<br/>
              (Current: {resonatedCount} | Max possible with rescues: {resonatedCount + (3 - rescuedCount)})
            </p>
            <button
              onClick={onRestart}
              className="flex items-center gap-2 font-mono text-[10px] text-zinc-400 hover:text-zinc-200 uppercase tracking-widest transition-colors py-2 px-4 border border-zinc-800 rounded-lg hover:bg-zinc-900"
            >
              <RotateCcw className="w-3 h-3" /> Restart Extraction
            </button>
          </div>
        ) : null}
        
        <button
          onClick={onProceed}
          disabled={!canProceed}
          className={`px-12 py-4 rounded-full font-mono text-xs font-bold uppercase tracking-widest transition-all ${
            canProceed 
            ? 'bg-zinc-50 text-zinc-950 hover:bg-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.1)]' 
            : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
          }`}
        >
          Seal Initial Selection
        </button>

        <div className="flex gap-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
           <span>Kept: {resonatedCount}</span>
           <span>Rescues: {rescuedCount}/3</span>
        </div>
      </div>
    </div>
  );
};
