import React from 'react';
import { motion } from 'motion/react';
import { ValueNode } from '../types';
import { Share2, RefreshCw, FileText } from 'lucide-react';

interface CrucibleResultProps {
  coreValues: ValueNode[];
  onReset: () => void;
  onProceed: () => void;
}

export const CrucibleResult: React.FC<CrucibleResultProps> = ({ coreValues, onReset, onProceed }) => {
  const coreValueIds = coreValues.map(v => v.id);

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
    <div className="flex-1 flex flex-col items-center p-4 md:p-8 max-w-5xl mx-auto w-full overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 md:mb-16 mt-4 md:mt-8"
      >
        <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600/10 border border-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
           <FileText className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 tracking-tighter uppercase">The Values Crucible</h1>
        <p className="text-zinc-500 font-mono text-[8px] md:text-[10px] uppercase tracking-[0.4em]">Core Alignment</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-12 md:mb-16 w-full">
        {coreValues.map((v, i) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ 
              duration: 0.8, 
              delay: 0.5 + (i * 0.4),
              ease: [0.19, 1, 0.22, 1] 
            }}
            className="p-6 md:p-8 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center text-center shadow-xl relative overflow-hidden group min-h-[400px]"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="font-mono text-[9px] md:text-[10px] text-blue-500 mb-3 md:mb-4 uppercase tracking-widest font-bold">Value {String(i + 1).padStart(2, '0')}</span>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 tracking-tight text-zinc-100">{v.label}</h2>
            
            <div className="space-y-4 md:space-y-6 mb-6 flex-1">
              <p className="text-zinc-300 text-xs md:text-sm leading-relaxed italic">
                "{v.simpleDefinition}"
              </p>
            </div>

            <div className="text-[8px] md:text-[10px] font-mono text-zinc-700 uppercase leading-snug border-t border-zinc-800 pt-4 md:pt-6 w-full">
               Schwartz Axis: <span className="text-zinc-500">{getPoleName(v.pole)}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col items-center gap-8 md:gap-12 w-full pt-8 border-t border-zinc-900 mb-8 md:mb-16"
      >
        <div className="max-w-2xl px-6 md:px-8 py-8 md:py-10 bg-zinc-900/30 border border-zinc-900 rounded-xl">
           <h3 className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2">
             <Share2 className="w-3 h-3" /> Crucible
           </h3>
           <p className="text-zinc-500 text-xs md:text-sm leading-relaxed md:indent-8 text-justify">
             Through its rigorous sorting process, the Crucible has navigated 60 philosophical concepts and engaged in direct bipolar trade-offs. 
             The values of <span className="text-zinc-200 font-bold">{coreValues.map(v => v.label).join(', ')}</span> represent 
             your current baseline for intentional living. These are not merely words, but the operational code 
             of your internal value system. Protect them, live by them, and use them as the primary lens for all future commitments.
           </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto mt-8">
           <button 
             onClick={onProceed}
             className="px-8 py-4 bg-zinc-100 text-zinc-950 hover:bg-white rounded-full font-mono text-[10px] md:text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-xl"
           >
             Proceed to Phase 2 // The Tempering
           </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto">
           <button 
             onClick={() => window.print()}
             className="px-8 py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-full font-mono text-[9px] md:text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all"
           >
             Export PDF
           </button>
           <button 
             onClick={onReset}
             className="px-8 py-3 bg-zinc-900 border border-zinc-800 hover:border-red-900/50 hover:text-red-500 rounded-full font-mono text-[9px] md:text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all"
           >
             <RefreshCw className="w-3 h-3" /> Reset
           </button>
        </div>
      </motion.div>
    </div>
  );
};
