export type Gender = 'male' | 'female';

export type Grade = '초심' | 'D조' | 'C조' | 'B조' | 'A조' | 'S조';

export interface Player {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  grade: Grade;
  playingToday: boolean;
  restedLastRound: boolean;
}

export interface Team {
  players: [Player, Player];
  totalSkill: number;
}

export interface CourtMatch {
  courtNumber: number;
  teamA: Team;
  teamB: Team;
  skillGap: number;
}

export interface MatchRound {
  id: string;
  createdAt: string;
  courtCount: number;
  matches: CourtMatch[];
  restingPlayers: Player[];
}

export interface AppState {
  players: Player[];
  matchHistory: MatchRound[];
}

export const AGE_OPTIONS = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70] as const;

export const GRADE_OPTIONS: Grade[] = ['초심', 'D조', 'C조', 'B조', 'A조', 'S조'];

export const GRADE_LABELS: Record<Grade, string> = {
  초심: '초심',
  'D조': 'D조',
  'C조': 'C조',
  'B조': 'B조',
  'A조': 'A조',
  'S조': 'S조',
};
