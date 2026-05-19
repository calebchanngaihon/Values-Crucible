/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layout } from './components/Layout';
import { useCrucibleState } from './hooks/useCrucibleState';
import { Stage } from './types';
import { PurgeStack } from './components/PurgeStack';
import { RescueValve } from './components/RescueValve';
import { TournamentBracket } from './components/TournamentBracket';
import { CastingCircle } from './components/CastingCircle';
import { CrucibleResult } from './components/CrucibleResult';
import { Theory } from './components/Theory';
import { BreathingExercise } from './components/BreathingExercise';
import { motion, AnimatePresence } from 'motion/react';
import { Book } from 'lucide-react';
import { DevTools } from './components/DevTools';

import { TheTempering } from './components/TheTempering';

export default function App() {
  const { 
    state, 
    updateValueStatus, 
    toggleValueStatus,
    rescueValue, 
    startTournament, 
    recordTournamentResult, 
    undoTournamentMatch,
    selectCoreValues, 
    completeBreathing,
    startTempering,
    resetStage,
    reset,
    __devSetState
  } = useCrucibleState();

  const [isTheoryOpen, setIsTheoryOpen] = React.useState(false);
  const [temperingTitle, setTemperingTitle] = React.useState('Tempering - Honing');

  const handleGlobalReset = () => {
    reset();
    setHasStarted(false);
  };

  const handleStageReset = () => {
    if (state.stage === Stage.TEMPERING) {
      window.dispatchEvent(new CustomEvent('RESET_TEMPERING_STAGE'));
    } else {
      resetStage();
    }
  };

  const progress = state.stage === Stage.PURGE 
    ? (state.currentIndex / 60) * 100 
    : state.stage === Stage.RESCUE ? 100 : undefined;

  const getStageTitle = () => {
    switch (state.stage) {
      case Stage.PURGE: return 'Forge - Extract';
      case Stage.RESCUE: return 'Forge - Extract (Rescue)';
      case Stage.TOURNAMENT: return 'Forge - Compress';
      case Stage.CASTING: return 'Forge - Casting';
      case Stage.CRUCIBLE: return 'Forge - Crucible';
      case Stage.TEMPERING: return temperingTitle;
      default: return '';
    }
  };

  const currentPair = (state.stage === Stage.TOURNAMENT && state.tournamentPairs && state.tournamentPairs.length > 0)
    ? [
        state.values.find(v => v.id === state.tournamentPairs[state.currentPairIndex]?.[0]),
        state.values.find(v => v.id === state.tournamentPairs[state.currentPairIndex]?.[1])
      ] as [any, any]
    : null;

  const hasValidPair = currentPair && currentPair[0] && currentPair[1];

  const [hasStarted, setHasStarted] = React.useState(state.currentIndex > 0 || state.stage !== Stage.PURGE);

  if (!hasStarted && state.stage === Stage.PURGE) {
    return (
      <Layout stageTitle="Entering the Crucible" onOpenTheory={() => setIsTheoryOpen(true)}>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto mt-[-5vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12 flex flex-col justify-center items-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 uppercase">The Values Crucible</h1>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.5em] mb-12">The Forge // The Tempering</p>
            <p className="text-zinc-400 text-sm leading-relaxed mb-12 text-justify md:indent-8">
              This is not a personality quiz. This is a rigorous tool designed to surface your non-negotiable core values. 
              You will move through two critical phases: <strong>The Forge</strong>, 
              and <strong>The Tempering</strong>) to clarify your values and find alignment with your life plans. 
              The value of this crucible lies in the difficulty of the choice.
            </p>
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={() => setHasStarted(true)}
                className="px-12 md:px-16 py-4 md:py-5 bg-zinc-50 text-zinc-950 rounded-full font-mono text-xs font-bold uppercase tracking-widest hover:bg-white transition-all shadow-2xl"
              >
                Initiate Crucible
              </button>
              <button
                onClick={() => setIsTheoryOpen(true)}
                className="flex items-center gap-2 px-5 py-2 mt-2 bg-blue-600/10 text-blue-500 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500/20 hover:text-blue-400 transition-colors border border-blue-500/20"
                >
                <Book className="w-3.5 h-3.5" />
                Read Theoretical Framework
              </button>
            </div>
          </motion.div>
          <motion.div 
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="font-mono text-[10px] text-amber-500/80 uppercase tracking-widest mt-12 font-semibold"
          >
            Warning: Productive Struggle Required
          </motion.div>
        </div>
        <Theory isOpen={isTheoryOpen} onClose={() => setIsTheoryOpen(false)} />
      </Layout>
    );
  }

  return (
    <Layout 
      progress={progress} 
      stageTitle={getStageTitle()} 
      onOpenTheory={() => setIsTheoryOpen(true)}
      onResetGlobal={handleGlobalReset}
      onResetStage={state.stage !== Stage.CRUCIBLE ? handleStageReset : undefined}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={state.stage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
          className="flex-1 flex flex-col"
        >
          {state.stage === Stage.PURGE && (
            <PurgeStack 
              currentValue={state.values[state.currentIndex]}
              onSelect={updateValueStatus}
              onUndo={toggleValueStatus}
              index={state.currentIndex}
              total={60}
              resonated={state.values.filter(v => v.status === 'resonated')}
              discarded={state.values.filter(v => v.status === 'discarded')}
            />
          )}

          {state.stage === Stage.RESCUE && (
            <RescueValve 
              discardedValues={state.values.filter(v => v.status === 'discarded')}
              resonatedCount={state.values.filter(v => v.status === 'resonated').length}
              rescuedCount={state.rescuedCount}
              onRescue={rescueValue}
              onProceed={startTournament}
              onRestart={handleStageReset}
            />
          )}

          {state.stage === Stage.TOURNAMENT && hasValidPair && (
            <TournamentBracket 
              pair={currentPair}
              onSelect={recordTournamentResult}
              onUndo={undoTournamentMatch}
              index={state.currentPairIndex}
              total={state.tournamentPairs?.length || 0}
              canUndo={(state.tournamentHistory?.length || 0) > 0}
            />
          )}

          {state.stage === Stage.BREATHING && (
            <BreathingExercise onComplete={completeBreathing} />
          )}

          {state.stage === Stage.CASTING && (
            <CastingCircle 
              finalists={[...state.values]
                .filter(v => v.status === 'resonated')
                .sort((a, b) => b.elo - a.elo)
                .slice(0, 6)
              }
              onComplete={selectCoreValues}
            />
          )}

          {state.stage === Stage.CRUCIBLE && (
            <CrucibleResult 
              coreValues={state.values.filter(v => state.coreValues.includes(v.id))}
              onReset={reset}
              onProceed={startTempering}
            />
          )}

          {state.stage === Stage.TEMPERING && (
            <TheTempering
              coreValues={state.values.filter(v => state.coreValues.includes(v.id))}
              allValues={state.values}
              onSubStageChange={setTemperingTitle}
            />
          )}
        </motion.div>
      </AnimatePresence>
      <Theory isOpen={isTheoryOpen} onClose={() => setIsTheoryOpen(false)} />
      <DevTools __devSetState={__devSetState} />
    </Layout>
  );
}

