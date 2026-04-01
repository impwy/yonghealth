import type { FootballMember, GradeGroup, TeamResult, TeamScenario } from '@/types';

export function getGradeGroup(grade: number): GradeGroup {
  switch (grade) {
    case 1: return '1등급';
    case 2: return '2등급';
    case 3: return '3등급';
    case 4: return '4등급';
    case 5: return '5등급';
    case 6: return '6등급';
    default: return '6등급';
  }
}

const GRADE_GROUP_ORDER: GradeGroup[] = ['1등급', '2등급', '3등급', '4등급', '5등급', '6등급'];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateTeams(members: FootballMember[], teamCount: number): TeamResult[] {
  const teams: FootballMember[][] = Array.from({ length: teamCount }, () => []);

  // 등급 그룹별로 분류
  const groups = new Map<GradeGroup, FootballMember[]>();
  for (const group of GRADE_GROUP_ORDER) {
    groups.set(group, []);
  }
  for (const member of members) {
    const group = getGradeGroup(member.grade);
    groups.get(group)!.push(member);
  }

  // 각 그룹별로 셔플 후 라운드로빈 분배 (시작 위치 랜덤)
  for (const group of GRADE_GROUP_ORDER) {
    const groupMembers = shuffle(groups.get(group)!);
    if (groupMembers.length === 0) continue;

    const startPos = Math.floor(Math.random() * teamCount);
    for (let i = 0; i < groupMembers.length; i++) {
      teams[(startPos + i) % teamCount].push(groupMembers[i]);
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
