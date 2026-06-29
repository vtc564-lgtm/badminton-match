import type { Gender, Grade, Player } from '../types';

const GRADE_BASE_SCORE: Record<Grade, number> = {
  S조: 110,
  A조: 100,
  B조: 85,
  C조: 70,
  D조: 55,
  초심: 40,
};

const GENDER_PENALTY: Record<Gender, number> = {
  male: 0,
  female: -20,
};

export function getAgePenalty(age: number): number {
  if (age >= 60) return -25;
  if (age >= 50) return -15;
  if (age === 45) return -8;
  if (age === 40) return -5;
  return 0;
}

export function calculateSkillScore(player: Pick<Player, 'gender' | 'age' | 'grade'>): number {
  const base = GRADE_BASE_SCORE[player.grade];
  const agePenalty = getAgePenalty(player.age);
  const genderPenalty = GENDER_PENALTY[player.gender];
  return base + agePenalty + genderPenalty;
}

export function getSkillBreakdown(player: Pick<Player, 'gender' | 'age' | 'grade'>) {
  return {
    base: GRADE_BASE_SCORE[player.grade],
    agePenalty: getAgePenalty(player.age),
    genderPenalty: GENDER_PENALTY[player.gender],
    total: calculateSkillScore(player),
  };
}
