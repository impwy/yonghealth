import type { FootballMember, GradeGroup, TeamResult, TeamScenario } from '@/types';

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

function findNextAvailableTeamIndex(
  teams: FootballMember[][],
  targetSizes: number[],
  startIndex: number,
): number {
  for (let offset = 0; offset < teams.length; offset++) {
    const teamIndex = (startIndex + offset) % teams.length;
    if (teams[teamIndex].length < targetSizes[teamIndex]) {
      return teamIndex;
    }
  }

  return startIndex;
}

export function generateTeams(members: FootballMember[], teamCount: number): TeamResult[] {
  const teams: FootballMember[][] = Array.from({ length: teamCount }, () => []);
  const targetSizes = getBalancedTeamSizes(members.length, teamCount);

  // 티어 그룹별로 분류
  const groups = new Map<GradeGroup, FootballMember[]>();
  for (const group of GRADE_GROUP_ORDER) {
    groups.set(group, []);
  }
  for (const member of members) {
    const group = getGradeGroup(member.grade);
    groups.get(group)!.push(member);
  }

  // 각 티어별로 셔플 후, 팀별 목표 인원 수를 넘기지 않도록 분배
  for (const group of GRADE_GROUP_ORDER) {
    const groupMembers = shuffle(groups.get(group)!);
    if (groupMembers.length === 0) continue;

    let nextTeamIndex = Math.floor(Math.random() * teamCount);
    for (const member of groupMembers) {
      const teamIndex = findNextAvailableTeamIndex(teams, targetSizes, nextTeamIndex);
      teams[teamIndex].push(member);
      nextTeamIndex = (teamIndex + 1) % teamCount;
    }
  }

  return teams.map((members, idx) => ({
    teamNumber: idx + 1,
    members,
  }));
}

export function generateScenarios(
  members: FootballMember[],
  teamCount: number,
  scenarioCount: number = 3,
): TeamScenario[] {
  return Array.from({ length: scenarioCount }, (_, i) => ({
    id: i + 1,
    teams: generateTeams(members, teamCount),
  }));
}
