import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import ts from 'typescript';

async function loadTeamGenerator() {
  const sourcePath = new URL('../src/lib/teamGenerator.ts', import.meta.url);
  const source = await readFile(sourcePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      isolatedModules: true,
      esModuleInterop: true,
    },
  });

  const tempDir = await mkdtemp(join(tmpdir(), 'yonghealth-team-generator-'));
  const modulePath = join(tempDir, 'teamGenerator.mjs');
  await writeFile(modulePath, transpiled.outputText);
  return import(`file://${modulePath}`);
}

function makeMember(id, grade) {
  return {
    id,
    name: `member-${id}`,
    grade,
    createdAt: '2026-04-18T00:00:00',
    updatedAt: '2026-04-18T00:00:00',
  };
}

function flattenIds(teams) {
  return teams.flatMap((team) => team.members.map((member) => member.id)).sort((a, b) => a - b);
}

function tierSpread(teams, grade) {
  const counts = teams.map((team) => team.members.filter((member) => member.grade === grade).length);
  return Math.max(...counts) - Math.min(...counts);
}

test('team count validation enforces 4 to 7 members per team', async () => {
  const { getTeamCountValidationMessage } = await loadTeamGenerator();

  assert.equal(getTeamCountValidationMessage(7, 2), '팀당 최소 4명이 되도록 팀 수를 줄여주세요.');
  assert.equal(getTeamCountValidationMessage(14, 3), '');
  assert.equal(getTeamCountValidationMessage(15, 2), '팀당 최대 7명이 되도록 팀 수를 늘려주세요.');
});

test('roulette plan keeps locked members and creates one step per unlocked member', async () => {
  const { buildRoulettePlan } = await loadTeamGenerator();
  const members = Array.from({ length: 10 }, (_, index) => makeMember(index + 1, (index % 5) + 1));

  const plan = buildRoulettePlan(members, 2, { 1: 0, 2: 1 });

  assert.equal(plan.steps.length, 8);
  assert.equal(plan.lockedMemberCount, 2);
  assert.equal(plan.rouletteMemberCount, 8);
  assert.deepEqual(plan.initialTeams[0].members.map((member) => member.id), [1]);
  assert.deepEqual(plan.initialTeams[1].members.map((member) => member.id), [2]);
  assert.deepEqual(flattenIds(plan.finalTeams), members.map((member) => member.id));
  assert.ok(plan.steps.every((step) => step.candidates.some((member) => member.id === step.selectedMember.id)));
  assert.ok(plan.steps.every((step) => step.selectedCandidateIndex >= 0));
  assert.ok(plan.steps.every((step) => step.spinRotationDeg > 0));
});

test('roulette plan balances team sizes and each tier within one member', async () => {
  const { buildRoulettePlan } = await loadTeamGenerator();
  const grades = [1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6];
  const members = grades.map((grade, index) => makeMember(index + 1, grade));

  const plan = buildRoulettePlan(members, 3);
  const sizes = plan.finalTeams.map((team) => team.members.length).sort((a, b) => a - b);

  assert.deepEqual(sizes, [4, 5, 5]);
  for (const grade of [1, 2, 3, 4, 5, 6]) {
    assert.ok(tierSpread(plan.finalTeams, grade) <= 1);
  }
});

test('roulette assignment picks the team that best balances grade sums after fixed members', async () => {
  const { buildRoulettePlan } = await loadTeamGenerator();
  const members = [
    makeMember(1, 6),
    makeMember(2, 1),
    makeMember(3, 6),
    makeMember(4, 6),
  ];

  const plan = buildRoulettePlan(members, 2, { 1: 0, 2: 1 });

  assert.equal(plan.steps.length, 2);
  assert.equal(plan.steps[0].targetTeamIndex, 1);
  assert.deepEqual(plan.finalTeams.map((team) => team.gradeSum).sort((a, b) => a - b), [7, 12]);
});
