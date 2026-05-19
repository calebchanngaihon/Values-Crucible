import { useState, useEffect, useCallback, useRef } from 'react';
import { CrucibleState, Stage, ValueNode } from '../types';
import { INITIAL_VALUES } from '../constants';

const STORAGE_KEY = 'crucible_state';
const ELO_K = 32;

export function useCrucibleState() {
  const [state, setState] = useState<CrucibleState>(() => {
    const defaultState: CrucibleState = {
      stage: Stage.PURGE,
      currentIndex: 0,
      values: [...INITIAL_VALUES].sort(() => Math.random() - 0.5),
      rescuedCount: 0,
      tournamentPairs: [],
      currentPairIndex: 0,
      coreValues: [],
      tournamentHistory: []
    };

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultState, ...parsed };
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
    return defaultState;
  });

  const lastCardTime = useRef(Date.now());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateValueStatus = useCallback((id: string, status: 'resonated' | 'discarded') => {
    const timeTakenMs = Date.now() - lastCardTime.current;
    lastCardTime.current = Date.now();

    setState(prev => {
      const nextValues = prev.values.map(v => v.id === id ? { ...v, status, purgeTimeMs: timeTakenMs } : v);
      const nextIndex = prev.currentIndex + 1;
      
      if (nextIndex >= 60) {
        return {
          ...prev,
          values: nextValues,
          currentIndex: nextIndex,
          stage: Stage.RESCUE
        };
      }
      
      return {
        ...prev,
        values: nextValues,
        currentIndex: nextIndex
      };
    });
  }, []);

  const toggleValueStatus = useCallback((id: string) => {
    setState(prev => {
      const nextValues = prev.values.map(v => {
        if (v.id === id) {
          return { ...v, status: v.status === 'resonated' ? 'discarded' : 'resonated' };
        }
        return v;
      });
      return { ...prev, values: nextValues };
    });
  }, []);

  const rescueValue = useCallback((id: string) => {
    setState(prev => {
      if (prev.rescuedCount >= 3) return prev;
      return {
        ...prev,
        rescuedCount: prev.rescuedCount + 1,
        values: prev.values.map(v => v.id === id ? { ...v, status: 'resonated' } : v)
      };
    });
  }, []);

  const startTournament = useCallback(() => {
    setState(prev => {
      const resonated = prev.values.filter(v => v.status === 'resonated');
      const pairs: [string, string][] = [];
      const matchCountPerValue = 2; // Each value should participate in at least 2 high-tension matches
      
      const potentialPairs: { a: string, b: string, tensionIndex: number }[] = [];

      // Calculate tension for all possible pairs
      for (let i = 0; i < resonated.length; i++) {
        for (let j = i + 1; j < resonated.length; j++) {
          const vA = resonated[i];
          const vB = resonated[j];
          const dist = Math.abs(vA.angle - vB.angle);
          const angularDist = dist > 180 ? 360 - dist : dist;
          
          // Schwartz's tension is highest at 180 degrees
          // We prioritize pairs close to 180 deg
          const tensionIndex = 180 - Math.abs(180 - angularDist); 
          
          potentialPairs.push({ a: vA.id, b: vB.id, tensionIndex });
        }
      }

      // Sort by tension (highest first)
      potentialPairs.sort((a, b) => b.tensionIndex - a.tensionIndex);
      
      const valueMatchCount: Record<string, number> = {};
      resonated.forEach(v => valueMatchCount[v.id] = 0);

      for (const p of potentialPairs) {
        // We want a robust tournament but not an endless one.
        // Aim for roughly (N * 2) / 2 = N pairs
        if (pairs.length >= resonated.length * 1.5) break; 
        
        if (valueMatchCount[p.a] < matchCountPerValue || valueMatchCount[p.b] < matchCountPerValue) {
          pairs.push([p.a, p.b]);
          valueMatchCount[p.a]++;
          valueMatchCount[p.b]++;
        }
      }
      
      return {
        ...prev,
        stage: Stage.TOURNAMENT,
        tournamentPairs: pairs.sort(() => Math.random() - 0.5), // Shuffle the final sequence for unpredictability
        currentPairIndex: 0
      };
    });
  }, []);

  const recordTournamentResult = useCallback((winnerId: string, loserId: string) => {
    setState(prev => {
      const winner = prev.values.find(v => v.id === winnerId)!;
      const loser = prev.values.find(v => v.id === loserId)!;
      
      const expectedWinner = 1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400));
      const expectedLoser = 1 / (1 + Math.pow(10, (winner.elo - loser.elo) / 400));
      
      const nextWinnerElo = winner.elo + ELO_K * (1 - expectedWinner);
      const nextLoserElo = loser.elo + ELO_K * (0 - expectedLoser);
      
      const result = {
        winnerId,
        loserId,
        winnerPreviousElo: winner.elo,
        loserPreviousElo: loser.elo
      };

      const nextValues = prev.values.map(v => {
        if (v.id === winnerId) return { ...v, elo: nextWinnerElo, wins: [...v.wins, loserId] };
        if (v.id === loserId) return { ...v, elo: nextLoserElo, losses: [...v.losses, winnerId] };
        return v;
      });
      
      const nextPairIndex = prev.currentPairIndex + 1;
      
      if (nextPairIndex >= prev.tournamentPairs.length) {
        return {
          ...prev,
          values: nextValues,
          stage: Stage.BREATHING,
          currentPairIndex: nextPairIndex,
          tournamentHistory: [...prev.tournamentHistory, result]
        };
      }
      
      return {
          ...prev,
          values: nextValues,
          currentPairIndex: nextPairIndex,
          tournamentHistory: [...prev.tournamentHistory, result]
      };
    });
  }, []);

  const undoTournamentMatch = useCallback(() => {
    setState(prev => {
      if (prev.tournamentHistory.length === 0 || prev.currentPairIndex === 0) return prev;
      
      const lastResult = prev.tournamentHistory[prev.tournamentHistory.length - 1];
      const nextHistory = prev.tournamentHistory.slice(0, -1);
      
      const nextValues = prev.values.map(v => {
        if (v.id === lastResult.winnerId) {
          return { 
            ...v, 
            elo: lastResult.winnerPreviousElo, 
            wins: v.wins.filter(id => id !== lastResult.loserId) 
          };
        }
        if (v.id === lastResult.loserId) {
          return { 
            ...v, 
            elo: lastResult.loserPreviousElo, 
            losses: v.losses.filter(id => id !== lastResult.winnerId) 
          };
        }
        return v;
      });
      
      return {
        ...prev,
        values: nextValues,
        currentPairIndex: prev.currentPairIndex - 1,
        tournamentHistory: nextHistory,
        stage: Stage.TOURNAMENT
      };
    });
  }, []);

  const selectCoreValues = useCallback((ids: string[]) => {
      if (ids.length !== 3) return;
      setState(prev => ({
          ...prev,
          coreValues: ids,
          stage: Stage.CRUCIBLE
      }));
  }, []);

  const completeBreathing = useCallback(() => {
    setState(prev => ({
      ...prev,
      stage: Stage.CASTING
    }));
  }, []);

  const startTempering = useCallback(() => {
    setState(prev => ({
      ...prev,
      stage: Stage.TEMPERING
    }));
  }, []);

  const resetStage = useCallback(() => {
    setState(prev => {
      switch (prev.stage) {
        case Stage.PURGE:
          return {
            ...prev,
            currentIndex: 0,
            values: [...INITIAL_VALUES].sort(() => Math.random() - 0.5)
          };
        case Stage.RESCUE:
          return {
            ...prev,
            stage: Stage.PURGE,
            currentIndex: 0,
            rescuedCount: 0,
            values: prev.values.map(v => ({ ...v, status: 'discarded' }))
          };
        case Stage.TOURNAMENT:
          return {
            ...prev,
            currentPairIndex: 0,
            tournamentHistory: [],
            values: prev.values.map(v => ({ ...v, elo: 1200, wins: [], losses: [] }))
          };
        case Stage.BREATHING:
          return prev;
        case Stage.CASTING:
          return {
            ...prev,
            coreValues: []
          };
        case Stage.CRUCIBLE:
          return {
            ...prev,
            stage: Stage.CASTING,
            coreValues: []
          };
        default:
          return prev;
      }
    });
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      stage: Stage.PURGE,
      currentIndex: 0,
      values: [...INITIAL_VALUES].sort(() => Math.random() - 0.5),
      rescuedCount: 0,
      tournamentPairs: [],
      currentPairIndex: 0,
      coreValues: [],
      tournamentHistory: []
    });
  }, []);

  return {
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
    __devSetState: setState
  };
}
