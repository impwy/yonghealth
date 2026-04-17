import type { FootballMember, GradeGroup, LockedAssignments, TeamResult, TeamScenario } from '@/types';

export function getGradeGroup(grade: number): GradeGroup {
  switch (grade) {
    case 1: return '1티어';
    case 2: return '2티어';
    case 3: return '3티어';
    case 4: return '4티어';
    case 5: return '5티어';
    case 6: return '6티어';
    default: return '6티어';
  }
}

const GRADE_GROUP_ORDER: GradeGroup[] = ['1티어', '2티어', '3티어', '4티어', '5티어', '6티어'];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getBalancedTeamSizes(memberCount: number, teamCount: number): number[] {
  if (teamCount <= 0) {
    return [];
  }

  const baseSize = Math.floor(memberCount / teamCount);
  const remainder = memberCount % teamCount;
  const sizes = Array.from({ length: teamCount }, () => baseSize);
  const extraSlotOrder = shuffle(Array.from({ length: teamCount }, (_, index) => index));

  for (let i = 0; i < remainder; i++) {
    sizes[extraSlotOrder[i]] += 1;
  }

  return sizes;
}

function sumGrades(members: FootballMember[]): number {
  return members.reduce((sum, member) => sum + member.grade, 0);
}

function countTier(team: FootballMember[], tier: GradeGroup): number {
  let count = 0;
  for (const member of team) {
    if (getGradeGroup(member.grade) === tier) count += 1;
  }
  return count;
}

function pickTeamForTier(
  teams: FootballMember[][],
  targetSizes: number[],
  tier: GradeGroup,
): number {
  const randomOrder = shuffle(Array.from({ length: teams.length }, (_, i) => i));

  let bestTierCount = Infinity;
  let bestTotal = Infinity;
  let bestTeam = -1;

  for (const idx of randomOrder) {
    if (teams[idx].length >= targetSizes[idx]) continue;
    const tierCount = countTier(teams[idx], tier);
    const total = teams[idx].length;
    if (tierCount < bestTierCount || (tierCount === bestTierCount && total < bestTotal)) {
      bestTierCount = tierCount;
      bestTotal = total;
      bestTeam = idx;
    }
  }

  if (bestTeam !== -1) return bestTeam;

  for (const idx of randomOrder) {
    const tierCount = countTier(teams[idx], tier);
    const total = teams[idx].length;
    if (tierCount < bestTierCount || (tierCount === bestTierCount && total < bestTotal)) {
      bestTierCount = tierCount;
      bestTotal = total;
      bestTeam = idx;
    }
  }

  return bestTeam;
}

function isValidLock(value: unknown, teamCount: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < teamCount;
}

export function generateTeams(
  members: FootballMember[],
  teamCount: number,
  lockedAssignments: LockedAssignments = {},
): TeamResult[] {
  const teams: FootballMember[][] = Array.from({ length: teamCount }, () => []);
  const targetSizes = getBalancedTeamSizes(members.length, teamCount);

  const remaining: FootballMember[] = [];
  for (const member of members) {
    const lockedTeam = lockedAssignments[member.id];
    if (isValidLock(lockedTeam, teamCount)) {
      teams[lockedTeam].push(member);
    } else {
      remaining.push(member);
    }
  }

  const groups = new Map<GradeGroup, FootballMember[]>();
  for (const group of GRADE_GROUP_ORDER) {
    groups.set(group, []);
  }
  for (const member of remaining) {
    groups.get(getGradeGroup(member.grade))!.push(member);
  }

  for (const group of GRADE_GROUP_ORDER) {
    const groupMembers = shuffle(groups.get(group)!);
    for (const member of groupMembers) {
      const idx = pickTeamForTier(teams, targetSizes, group);
      teams[idx].push(member);
    }
  }

  return teams.map((teamMembers, idx) => ({
    teamNumber: idx + 1,
    members: teamMembers,
    gradeSum: sumGrades(teamMembers),
  }));
}

export function generateScenarios(
  members: FootballMember[],
  teamCount: number,
  scenarioCount: number = 1,
  lockedAssignments: LockedAssignments = {},
): TeamScenario[] {
  return Array.from({ length: scenarioCount }, (_, i) => ({
    id: i + 1,
    teams: generateTeams(members, teamCount, lockedAssignments),
  }));
}

export function formatTeamsForClipboard(teams: TeamResult[]): string {
  return teams
    .map((team) => `${team.teamNumber}팀: ${team.members.map((m) => m.name).join(', ')}`)
    .join('\n');
}
