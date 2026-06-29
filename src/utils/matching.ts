import type { CourtMatch, MatchRound, Player, Team } from '../types';
import { calculateSkillScore } from './skillScore';

interface ScoredPlayer extends Player {
  skillScore: number;
}

function withSkillScore(player: Player): ScoredPlayer {
  return { ...player, skillScore: calculateSkillScore(player) };
}

function makeTeam(p1: ScoredPlayer, p2: ScoredPlayer): Team {
  return {
    players: [p1, p2],
    totalSkill: p1.skillScore + p2.skillScore,
  };
}

function bestSplit(players: ScoredPlayer[]): { teamA: Team; teamB: Team; skillGap: number } {
  const [a, b, c, d] = players;
  const splits: [ScoredPlayer, ScoredPlayer, ScoredPlayer, ScoredPlayer][] = [
    [a, b, c, d],
    [a, c, b, d],
    [a, d, b, c],
  ];

  let best = {
    teamA: makeTeam(a, b),
    teamB: makeTeam(c, d),
    skillGap: Math.abs(a.skillScore + b.skillScore - (c.skillScore + d.skillScore)),
  };

  for (const [p1, p2, p3, p4] of splits) {
    const teamA = makeTeam(p1, p2);
    const teamB = makeTeam(p3, p4);
    const skillGap = Math.abs(teamA.totalSkill - teamB.totalSkill);
    if (skillGap < best.skillGap) {
      best = { teamA, teamB, skillGap };
    }
  }

  return best;
}

function groupVariance(players: ScoredPlayer[]): number {
  const scores = players.map((p) => p.skillScore);
  const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return scores.reduce((sum, score) => sum + (score - avg) ** 2, 0);
}

function pickBestQuartet(candidates: ScoredPlayer[]): ScoredPlayer[] {
  if (candidates.length <= 4) {
    return candidates.slice(0, 4);
  }

  let bestGroup = candidates.slice(0, 4);
  let bestVariance = groupVariance(bestGroup);

  for (let i = 0; i < candidates.length - 3; i += 1) {
    for (let j = i + 1; j < candidates.length - 2; j += 1) {
      for (let k = j + 1; k < candidates.length - 1; k += 1) {
        for (let l = k + 1; l < candidates.length; l += 1) {
          const group = [candidates[i], candidates[j], candidates[k], candidates[l]];
          const variance = groupVariance(group);
          if (variance < bestVariance) {
            bestVariance = variance;
            bestGroup = group;
          }
        }
      }
    }
  }

  return bestGroup;
}

function sortByRestPriority(players: ScoredPlayer[]): ScoredPlayer[] {
  return [...players].sort((a, b) => {
    if (a.restedLastRound !== b.restedLastRound) {
      return a.restedLastRound ? -1 : 1;
    }
    return a.name.localeCompare(b.name, 'ko');
  });
}

export interface MatchResult {
  round: MatchRound;
  updatedPlayers: Player[];
}

export function createMatchRound(players: Player[], courtCount: number): MatchResult | null {
  const activePlayers = players.filter((player) => player.playingToday);
  const slots = courtCount * 4;

  if (activePlayers.length < 4) {
    return null;
  }

  const scored = sortByRestPriority(activePlayers.map(withSkillScore));
  const playing = scored.slice(0, Math.min(slots, scored.length));
  const resting = scored.slice(playing.length);

  const matches: CourtMatch[] = [];
  const remaining = [...playing];

  for (let court = 1; court <= courtCount && remaining.length >= 4; court += 1) {
    const quartet = pickBestQuartet(remaining);
    const split = bestSplit(quartet);

    matches.push({
      courtNumber: court,
      teamA: split.teamA,
      teamB: split.teamB,
      skillGap: split.skillGap,
    });

    const selectedIds = new Set(quartet.map((player) => player.id));
    for (let i = remaining.length - 1; i >= 0; i -= 1) {
      if (selectedIds.has(remaining[i].id)) {
        remaining.splice(i, 1);
      }
    }
  }

  const playingIds = new Set(matches.flatMap((match) => [
    ...match.teamA.players.map((player) => player.id),
    ...match.teamB.players.map((player) => player.id),
  ]));

  const updatedPlayers = players.map((player) => {
    if (!player.playingToday) {
      return player;
    }
    return {
      ...player,
      restedLastRound: !playingIds.has(player.id),
    };
  });

  const round: MatchRound = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    courtCount,
    matches,
    restingPlayers: resting.map(({ skillScore: _skillScore, ...player }) => player),
  };

  return { round, updatedPlayers };
}
