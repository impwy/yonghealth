import type {
  FootballMember,
  GradeGroup,
  LockedAssignments,
  RoulettePlan,
  TeamResult,
  TeamScenario,
} from '@/types';

export const MIN_FOOTBALL_TEAM_SIZE = 4;
export const MAX_FOOTBALL_TEAM_SIZE = 7;

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

export function getTeamCountValidationMessage(memberCount: number, teamCount: number) {
  if (memberCount < 2) {
    return '회원이 2명 이상 있어야 팀을 만들 수 있습니다.';
  }

  if (teamCount < 2) {
    return '팀 수는 최소 2팀 이상이어야 합니다.';
  }

  if (teamCount > memberCount) {
    return '팀 수는 선택된 인원 수보다 많을 수 없습니다.';
  }

  const teamSizes = getBalancedTeamSizes(memberCount, teamCount);
  if (teamSizes.length === 0) {
    return '팀 수는 최소 2팀 이상이어야 합니다.';
  }

  if (Math.min(...teamSizes) < MIN_FOOTBALL_TEAM_SIZE) {
    return `팀당 최소 ${MIN_FOOTBALL_TEAM_SIZE}명이 되도록 팀 수를 줄여주세요.`;
  }

  if (Math.max(...teamSizes) > MAX_FOOTBALL_TEAM_SIZE) {
    return `팀당 최대 ${MAX_FOOTBALL_TEAM_SIZE}명이 되도록 팀 수를 늘려주세요.`;
  }

  return '';
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

function getGradeSpreadAfterAssignment(
  teams: FootballMember[][],
  teamIndex: number,
  member: FootballMember,
) {
  const gradeSums = teams.map((team, idx) => sumGrades(team) + (idx === teamIndex ? member.grade : 0));
  return Math.max(...gradeSums) - Math.min(...gradeSums);
}

function getTierSpreadAfterAssignment(
  teams: FootballMember[][],
  teamIndex: number,
  tier: GradeGroup,
) {
  const tierCounts = teams.map((team, idx) => countTier(team, tier) + (idx === teamIndex ? 1 : 0));
  return Math.max(...tierCounts) - Math.min(...tierCounts);
}

function getSizeSpreadAfterAssignment(teams: FootballMember[][], teamIndex: number) {
  const sizes = teams.map((team, idx) => team.length + (idx === teamIndex ? 1 : 0));
  return Math.max(...sizes) - Math.min(...sizes);
}

function pickTeamForMember(
  teams: FootballMember[][],
  targetSizes: number[],
  tier: GradeGroup,
  member: FootballMember,
): number {
  const randomOrder = shuffle(Array.from({ length: teams.length }, (_, i) => i));
  const candidateTeams = randomOrder.filter((idx) => teams[idx].length < targetSizes[idx]);
  const searchOrder = candidateTeams.length > 0 ? candidateTeams : randomOrder;

  let bestTeam = searchOrder[0] ?? -1;
  let bestScore: {
    gradeSpread: number;
    tierSpread: number;
    sizeSpread: number;
    targetFill: number;
    gradeSum: number;
  } | null = null;

  for (const idx of searchOrder) {
    const score = {
      gradeSpread: getGradeSpreadAfterAssignment(teams, idx, member),
      tierSpread: getTierSpreadAfterAssignment(teams, idx, tier),
      sizeSpread: getSizeSpreadAfterAssignment(teams, idx),
      targetFill: targetSizes[idx] > 0 ? (teams[idx].length + 1) / targetSizes[idx] : Infinity,
      gradeSum: sumGrades(teams[idx]) + member.grade,
    };

    if (
      bestScore === null ||
      score.gradeSpread < bestScore.gradeSpread ||
      (score.gradeSpread === bestScore.gradeSpread && score.tierSpread < bestScore.tierSpread) ||
      (
        score.gradeSpread === bestScore.gradeSpread &&
        score.tierSpread === bestScore.tierSpread &&
        score.sizeSpread < bestScore.sizeSpread
      ) ||
      (
        score.gradeSpread === bestScore.gradeSpread &&
        score.tierSpread === bestScore.tierSpread &&
        score.sizeSpread === bestScore.sizeSpread &&
        score.targetFill < bestScore.targetFill
      ) ||
      (
        score.gradeSpread === bestScore.gradeSpread &&
        score.tierSpread === bestScore.tierSpread &&
        score.sizeSpread === bestScore.sizeSpread &&
        score.targetFill === bestScore.targetFill &&
        score.gradeSum < bestScore.gradeSum
      )
    ) {
      bestScore = score;
      bestTeam = idx;
    }
  }

  return bestTeam;
}

function getSpinRotationDeg(previousRotationDeg: number, candidateCount: number, selectedIndex: number) {
  if (candidateCount <= 0) return previousRotationDeg;

  const segmentDeg = 360 / candidateCount;
  const selectedCenterDeg = selectedIndex * segmentDeg + segmentDeg / 2;
  const targetRotationMod = (360 - selectedCenterDeg) % 360;
  const currentRotationMod = previousRotationDeg % 360;
  const deltaToTarget = (targetRotationMod - currentRotationMod + 360) % 360;

  return previousRotationDeg + 360 * 4 + deltaToTarget;
}

function isValidLock(value: unknown, teamCount: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < teamCount;
}

function toTeamResults(teams: FootballMember[][]): TeamResult[] {
  return teams.map((teamMembers, idx) => ({
    teamNumber: idx + 1,
    members: [...teamMembers],
    gradeSum: sumGrades(teamMembers),
  }));
}

function prepareTeams(
  members: FootballMember[],
  teamCount: number,
  lockedAssignments: LockedAssignments = {},
): {
  teams: FootballMember[][];
  remaining: FootballMember[];
} {
  const teams: FootballMember[][] = Array.from({ length: teamCount }, () => []);
  const remaining: FootballMember[] = [];

  for (const member of members) {
    const lockedTeam = lockedAssignments[member.id];
    if (isValidLock(lockedTeam, teamCount)) {
      teams[lockedTeam].push(member);
    } else {
      remaining.push(member);
    }
  }

  return { teams, remaining };
}

function groupByTier(members: FootballMember[]) {
  const groups = new Map<GradeGroup, FootballMember[]>();
  for (const group of GRADE_GROUP_ORDER) {
    groups.set(group, []);
  }
  for (const member of members) {
    groups.get(getGradeGroup(member.grade))!.push(member);
  }
  return groups;
}

export function buildRoulettePlan(
  members: FootballMember[],
  teamCount: number,
  lockedAssignments: LockedAssignments = {},
): RoulettePlan {
  const targetSizes = getBalancedTeamSizes(members.length, teamCount);
  const { teams, remaining } = prepareTeams(members, teamCount, lockedAssignments);
  const initialTeams = toTeamResults(teams);
  const groups = groupByTier(remaining);
  const steps: RoulettePlan['steps'] = [];
  let spinRotationDeg = 0;

  for (const group of GRADE_GROUP_ORDER) {
    const groupMembers = [...groups.get(group)!];
    while (groupMembers.length > 0) {
      const candidates = [...groupMembers];
      const selectedIndex = Math.floor(Math.random() * groupMembers.length);
      const [member] = groupMembers.splice(selectedIndex, 1);
      const idx = pickTeamForMember(teams, targetSizes, group, member);

      spinRotationDeg = getSpinRotationDeg(spinRotationDeg, candidates.length, selectedIndex);

      if (idx >= 0) {
        teams[idx].push(member);
      }

      steps.push({
        id: steps.length + 1,
        tier: group,
        targetTeamIndex: idx,
        targetTeamNumber: idx + 1,
        candidates,
        selectedCandidateIndex: selectedIndex,
        selectedMember: member,
        spinRotationDeg,
        teams: toTeamResults(teams),
      });
    }
  }

  return {
    initialTeams,
    lockedMemberCount: members.length - remaining.length,
    rouletteMemberCount: remaining.length,
    targetSizes,
    steps,
    finalTeams: toTeamResults(teams),
  };
}

export function generateTeams(
  members: FootballMember[],
  teamCount: number,
  lockedAssignments: LockedAssignments = {},
): TeamResult[] {
  return buildRoulettePlan(members, teamCount, lockedAssignments).finalTeams;
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
