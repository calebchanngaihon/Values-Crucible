export enum Stage {
  PURGE = 'PURGE',
  RESCUE = 'RESCUE',
  TOURNAMENT = 'TOURNAMENT',
  BREATHING = 'BREATHING',
  CASTING = 'CASTING',
  CRUCIBLE = 'CRUCIBLE',
  TEMPERING = 'TEMPERING'
}

export interface ValueNode {
  id: string;
  label: string;
  pole: number;
  angle: number;
  simpleDefinition: string;
  studentDefinition: string;
  status: 'unseen' | 'resonated' | 'discarded';
  purgeTimeMs?: number;
  elo: number;
  wins: string[];
  losses: string[];
}

export interface TournamentResult {
  winnerId: string;
  loserId: string;
  winnerPreviousElo: number;
  loserPreviousElo: number;
}

export interface CrucibleState {
  stage: Stage;
  currentIndex: number;
  values: ValueNode[];
  rescuedCount: number;
  tournamentPairs: [string, string][];
  currentPairIndex: number;
  coreValues: string[];
  tournamentHistory: TournamentResult[];
}
