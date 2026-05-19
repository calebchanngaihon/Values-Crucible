import React, { useState } from 'react';
import { Stage, CrucibleState } from '../types';
import { INITIAL_VALUES } from '../constants';
import { Settings } from 'lucide-react';

export const DevTools = ({ __devSetState }: { __devSetState: (s: Partial<CrucibleState>) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const jumpTo = (stage: Stage) => {
    let baseState = {
      stage,
      currentIndex: 0,
      values: [...INITIAL_VALUES],
      rescuedCount: 0,
      tournamentPairs: [],
      currentPairIndex: 0,
      coreValues: [],
      tournamentHistory: []
    } as any;

    if (stage === Stage.RESCUE || stage === Stage.TOURNAMENT) {
       baseState.values.forEach((v: any, i: number) => {
          v.status = i < 15 ? 'resonated' : 'discarded';
       });
       baseState.currentIndex = 60;
    }
    
    if (stage === Stage.TOURNAMENT) {
       baseState.tournamentPairs = [
          [baseState.values[0].id, baseState.values[1].id]
       ];
    }
    
    if (stage === Stage.CASTING || stage === Stage.CRUCIBLE || stage === Stage.TEMPERING) {
       baseState.values.forEach((v: any, i: number) => {
          v.status = i < 6 ? 'resonated' : 'discarded';
          if (i < 6) v.elo = 1600 + i * 10;
       });
    }

    if (stage === Stage.CRUCIBLE || stage === Stage.TEMPERING) {
       baseState.coreValues = [
          baseState.values[0].id,
          baseState.values[1].id,
          baseState.values[2].id
       ];
    }
    
    __devSetState(baseState);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-[4.5rem] left-6 z-[100]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#09090b] border border-[#27272a] text-zinc-500 hover:text-zinc-300 hover:bg-[#18181b] rounded-md transition-colors shadow-sm"
        title="Dev Sandbox"
      >
        <Settings className="w-3.5 h-3.5" />
        <span className="font-mono text-[10px] uppercase tracking-wider font-bold">Dev Mode</span>
      </button>

      {isOpen && (
        <div className="absolute top-10 left-0 bg-[#09090b] border border-[#27272a] p-3 rounded-lg flex flex-col gap-2 max-h-[70vh] overflow-y-auto shadow-2xl w-48 origin-top-left">
           <div className="text-[10px] text-zinc-500 font-mono text-center uppercase border-b border-[#27272a] pb-2 mb-1 tracking-widest font-bold">Dev Sandbox</div>
           <button onClick={() => jumpTo(Stage.PURGE)} className="text-[10px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 text-left px-3 py-2 rounded transition-colors uppercase tracking-wider">Forge - Extract</button>
           <button onClick={() => jumpTo(Stage.RESCUE)} className="text-[10px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 text-left px-3 py-2 rounded transition-colors uppercase tracking-wider">Forge - Extract (Rescue)</button>
           <button onClick={() => jumpTo(Stage.TOURNAMENT)} className="text-[10px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 text-left px-3 py-2 rounded transition-colors uppercase tracking-wider">Forge - Compress</button>
           <button onClick={() => jumpTo(Stage.CASTING)} className="text-[10px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 text-left px-3 py-2 rounded transition-colors uppercase tracking-wider">Forge - Casting</button>
           <button onClick={() => jumpTo(Stage.CRUCIBLE)} className="text-[10px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 text-left px-3 py-2 rounded transition-colors uppercase tracking-wider">Forge - Crucible</button>
           <button onClick={() => { jumpTo(Stage.TEMPERING); setTimeout(() => window.dispatchEvent(new CustomEvent('DEV_JUMP_TEMPERING', { detail: 'STAGE_01_HONING' })), 100); setIsOpen(false); }} className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 text-left px-3 py-2 rounded transition-colors uppercase tracking-wider bg-blue-900/20 text-blue-400 mt-2">Tempering - Honing</button>
           <button onClick={() => { jumpTo(Stage.TEMPERING); setTimeout(() => window.dispatchEvent(new CustomEvent('DEV_JUMP_TEMPERING', { detail: 'STAGE_02_ANVIL' })), 100); setIsOpen(false); }} className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 text-left px-3 py-2 rounded transition-colors uppercase tracking-wider bg-blue-900/20 text-blue-400">Tempering - Anvil</button>
           <button onClick={() => { jumpTo(Stage.TEMPERING); setTimeout(() => window.dispatchEvent(new CustomEvent('DEV_JUMP_TEMPERING', { detail: 'STAGE_03_QUENCHING' })), 100); setIsOpen(false); }} className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 text-left px-3 py-2 rounded transition-colors uppercase tracking-wider bg-blue-900/20 text-blue-400 mb-2">Tempering - Quenching</button>
        </div>
      )}
    </div>
  );
};
