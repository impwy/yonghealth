'use client';

import { useEffect, useRef, useState } from 'react';
import type {
  FootballMember,
  RouletteAssignmentStep,
  RoulettePlan,
  RouletteSpinPhase,
  TeamGenerationMode,
  TeamScenario,
} from '@/types';
import {
  formatTeamsForClipboard,
  getBalancedTeamSizes,
  getGradeGroup,
  getTeamCountValidationMessage,
  MIN_FOOTBALL_TEAM_SIZE,
} from '@/lib/teamGenerator';
import EmptyState from '@/components/ui/EmptyState';

interface TeamGeneratorProps {
  members: FootballMember[];
  totalMemberCount: number;
  teamCount: number;
  onTeamCountChange: (teamCount: number) => void;
  scenario: TeamScenario | null;
  onGenerate: (teamCount: number) => void;
  onGenerateRoulette: (teamCount: number) => void;
  saveName: string;
  onSaveNameChange: (value: string) => void;
  onSaveScenario: () => void;
  saving: boolean;
  lockedCount: number;
  roulettePlan: RoulettePlan | null;
  rouletteStepIndex: number;
  roulettePhase: RouletteSpinPhase;
}

const WHEEL_COLORS = ['#059669', '#0284c7', '#d97706', '#e11d48', '#7c3aed', '#0891b2', '#65a30d'];
const ROULETTE_SPIN_DURATION_MS = 2200;

function buildWheelGradient(count: number) {
  if (count <= 0) return '#d1d5db';
  const segment = 100 / count;
  return `conic-gradient(${Array.from({ length: count }, (_, index) => {
    const start = index * segment;
    const end = start + segment;
    return `${WHEEL_COLORS[index % WHEEL_COLORS.length]} ${start}% ${end}%`;
  }).join(', ')})`;
}

function getMemberInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || '?';
}

function getCandidateLabelPosition(index: number, count: number) {
  if (count <= 0) return 'translate(-50%, -50%)';
  const segment = 360 / count;
  const angle = index * segment + segment / 2;
  return `translate(-50%, -50%) rotate(${angle}deg) translateY(-82px) rotate(-${angle}deg)`;
}

function RouletteWheel({
  step,
  phase,
  completedSteps,
  totalSteps,
}: {
  step: RouletteAssignmentStep | null;
  phase: RouletteSpinPhase;
  completedSteps: number;
  totalSteps: number;
}) {
  const candidates = step?.candidates ?? [];
  const selectedId = step?.selectedMember.id;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const isSpinning = phase === 'spinning';
  const [wheelRotationDeg, setWheelRotationDeg] = useState(0);

  useEffect(() => {
    const nextRotationDeg = step?.spinRotationDeg ?? 0;
    const frame = requestAnimationFrame(() => {
      setWheelRotationDeg(nextRotationDeg);
    });
    return () => cancelAnimationFrame(frame);
  }, [step?.spinRotationDeg]);

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
        <div className="relative mx-auto aspect-square w-full max-w-[240px]">
          <div className="absolute left-1/2 top-0 z-20 h-0 w-0 -translate-x-1/2 -translate-y-1 border-x-[12px] border-t-[22px] border-x-transparent border-t-amber-500 drop-shadow" />
          <div
            className="football-roulette-wheel relative h-full w-full overflow-hidden rounded-full border-[10px] border-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]"
            style={{
              background: buildWheelGradient(candidates.length),
              transform: `rotate(${wheelRotationDeg}deg)`,
              transition: isSpinning
                ? `transform ${ROULETTE_SPIN_DURATION_MS}ms cubic-bezier(0.12, 0.78, 0.18, 1)`
                : 'transform 180ms ease-out',
            }}
            aria-label="룰렛 휠"
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,_transparent_0_31%,_rgba(255,255,255,0.18)_31%_32%,_transparent_32%)]" />
            {candidates.map((member, index) => (
              <div
                key={member.id}
                className="absolute left-1/2 top-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[11px] font-black text-gray-900 shadow-sm"
                style={{ transform: getCandidateLabelPosition(index, candidates.length) }}
                title={member.name}
              >
                {getMemberInitial(member.name)}
              </div>
            ))}
            <div className="absolute inset-[32%] flex flex-col items-center justify-center rounded-full border border-white/70 bg-white text-center shadow-inner">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                {isSpinning ? 'Spinning' : 'Picked'}
              </span>
              <span className="mt-1 max-w-[72px] truncate text-sm font-black text-gray-900">
                {phase === 'settled' && step ? step.selectedMember.name : `${candidates.length}명`}
              </span>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-[9px] rounded-full border border-white/40" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
              {step ? `${step.tier} → ${step.targetTeamNumber}팀` : '룰렛 대기'}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {completedSteps}/{totalSteps} 스핀
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-3 break-keep text-sm font-semibold text-gray-900">
            {phase === 'spinning' && step
              ? `${step.tier} 후보 ${candidates.length}명 중 한 명을 돌리는 중`
              : phase === 'settled' && step
                ? `${step.selectedMember.name} → ${step.targetTeamNumber}팀 배정 완료`
                : '룰렛을 시작하면 한 스핀에 한 명씩 배정됩니다.'}
          </p>
          {step && (
            <p className="mt-1 break-keep text-xs leading-5 text-gray-500">
              당첨된 멤버는 팀별 티어합과 인원 수가 가장 균형에 가까워지는 팀으로 들어갑니다.
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {candidates.map((member, index) => (
              <span
                key={member.id}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                  phase === 'settled' && selectedId === member.id
                    ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px]">
                  {getMemberInitial(member.name)}
                </span>
                {index + 1}. {member.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamGenerator({
  members,
  totalMemberCount,
  teamCount,
  onTeamCountChange,
  scenario,
  onGenerate,
  onGenerateRoulette,
  saveName,
  onSaveNameChange,
  onSaveScenario,
  saving,
  lockedCount,
  roulettePlan,
  rouletteStepIndex,
  roulettePhase,
}: TeamGeneratorProps) {
  const [teamCountInput, setTeamCountInput] = useState(String(teamCount));
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [generationMode, setGenerationMode] = useState<TeamGenerationMode>('random');
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxTeamCount = Math.max(2, Math.floor(members.length / MIN_FOOTBALL_TEAM_SIZE));
  const validationMessage = getTeamCountValidationMessage(members.length, teamCount);
  const canGenerate = validationMessage === '';
  const balancedTeamSizes = getBalancedTeamSizes(members.length, teamCount);
  const isRouletteRunning = roulettePlan !== null && roulettePhase !== 'idle';
  const activeRouletteStep = roulettePlan
    ? roulettePhase === 'idle'
      ? roulettePlan.steps.at(-1) ?? null
      : roulettePlan.steps[rouletteStepIndex] ?? null
    : null;
  const completedRouletteSteps = roulettePlan
    ? roulettePhase === 'idle'
      ? roulettePlan.steps.length
      : rouletteStepIndex + (roulettePhase === 'settled' ? 1 : 0)
    : 0;

  useEffect(() => {
    setTeamCountInput(String(teamCount));
  }, [teamCount]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const commitTeamCount = (rawValue: string) => {
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) {
      setTeamCountInput(String(teamCount));
      return teamCount;
    }

    const parsed = Number(trimmedValue);
    if (!Number.isFinite(parsed)) {
      setTeamCountInput(String(teamCount));
      return teamCount;
    }

    const normalized = Math.min(Math.max(Math.trunc(parsed), 2), maxTeamCount);
    onTeamCountChange(normalized);
    setTeamCountInput(String(normalized));
    return normalized;
  };

  const handleGenerateClick = () => {
    const nextTeamCount = commitTeamCount(teamCountInput);
    if (generationMode === 'roulette') {
      onGenerateRoulette(nextTeamCount);
      return;
    }
    onGenerate(nextTeamCount);
  };

  const handleStepChange = (delta: number) => {
    const nextTeamCount = Math.min(Math.max(teamCount + delta, 2), maxTeamCount);
    onTeamCountChange(nextTeamCount);
    setTeamCountInput(String(nextTeamCount));
  };

  const handleCopy = async () => {
    if (!scenario || isRouletteRunning) return;
    const text = formatTeamsForClipboard(scenario.teams);
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopyState('idle'), 2000);
  };

  return (
    <section className="space-y-4">
      <div className="football-panel overflow-hidden rounded-2xl">
        <div className="football-shell px-4 py-4 text-white md:px-5">
          <div className="relative z-10 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                Match Builder
              </p>
              <h2 className="mt-1 break-keep text-lg font-bold">팀 편성</h2>
              <p className="mt-1 max-w-xl break-keep text-sm leading-6 text-emerald-100">
                선택한 멤버를 티어가 균등하게 섞이도록 분배합니다. 룰렛은 한 스핀에 한 명씩 배정합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-emerald-900">편성 규칙</p>
                {lockedCount > 0 && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                    고정 {lockedCount}명 우선 배치
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['1티어', '2티어', '3티어', '4티어', '5티어', '6티어'].map((group) => (
                  <span
                    key={group}
                    className="football-chip rounded-full px-2 py-0.5 text-[11px] font-medium"
                  >
                    {group}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-emerald-800/80">
                고정 인원을 먼저 배치하고, 남은 멤버만 룰렛에 넣어 한 명씩 티어합과 인원 수가 맞는 팀으로 보냅니다.
              </p>
              <p className="mt-2 text-xs font-medium text-emerald-900">
                등록 {totalMemberCount}명 중 이번 경기 {members.length}명 선택
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-white/70 p-1">
                {[
                  { mode: 'random' as const, label: '완전 랜덤' },
                  { mode: 'roulette' as const, label: '룰렛' },
                ].map(({ mode, label }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setGenerationMode(mode)}
                    disabled={isRouletteRunning}
                    className={`min-h-[40px] rounded-lg px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      generationMode === mode
                        ? 'bg-football-700 text-white shadow-sm'
                        : 'bg-white text-football-800 hover:bg-emerald-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <label htmlFor="team-count" className="block text-sm font-semibold text-gray-700">
                팀 수
              </label>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStepChange(-1)}
                  disabled={teamCount <= 2}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-300 bg-white text-lg font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-football-800 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="팀 수 감소"
                >
                  -
                </button>
                <input
                  id="team-count"
                  type="number"
                  min={2}
                  value={teamCountInput}
                  onChange={(e) => setTeamCountInput(e.target.value)}
                  onBlur={(e) => commitTeamCount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitTeamCount(teamCountInput);
                    }
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-center text-base font-semibold text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => handleStepChange(1)}
                  disabled={teamCount >= maxTeamCount}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-300 bg-white text-lg font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-football-800 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="팀 수 증가"
                >
                  +
                </button>
                <span className="shrink-0 text-sm font-medium text-gray-500">팀</span>
              </div>
              {balancedTeamSizes.length > 0 && (
                <p className="mt-2 text-xs font-medium text-football-800">
                  예상 인원: {balancedTeamSizes.map((size) => `${size}명`).join(' / ')}
                </p>
              )}
              {validationMessage && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  {validationMessage}
                </p>
              )}
              <button
                type="button"
                onClick={handleGenerateClick}
                disabled={!canGenerate || isRouletteRunning}
                className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-football-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-football-800 active:bg-football-900 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isRouletteRunning
                  ? '룰렛 진행 중...'
                  : generationMode === 'roulette'
                    ? scenario ? '룰렛 다시 시작' : '룰렛 시작'
                    : scenario ? '다시 굴리기' : '랜덤 편성 생성'}
              </button>
            </div>
          </div>

          {!scenario ? (
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40">
              <EmptyState
                icon="🥅"
                title="편성 결과가 아직 없습니다"
                description="이번 경기 멤버를 선택하고 팀 수를 정한 뒤 편성을 시작하세요."
                action={canGenerate ? {
                  label: generationMode === 'roulette' ? '룰렛 시작' : '첫 편성 만들기',
                  onClick: handleGenerateClick,
                } : undefined}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {generationMode === 'roulette' && roulettePlan && (
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Locked</p>
                      <p className="mt-1 text-sm font-black text-gray-900">{roulettePlan.lockedMemberCount}명 고정</p>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Roulette</p>
                      <p className="mt-1 text-sm font-black text-gray-900">{roulettePlan.rouletteMemberCount}명 회전</p>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Spin</p>
                      <p className="mt-1 text-sm font-black text-gray-900">{completedRouletteSteps}/{roulettePlan.steps.length}</p>
                    </div>
                  </div>
                  <RouletteWheel
                    step={activeRouletteStep}
                    phase={roulettePhase}
                    completedSteps={completedRouletteSteps}
                    totalSteps={roulettePlan.steps.length}
                  />
                </div>
              )}

              <div className="flex flex-col gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 md:flex-row md:items-end md:gap-3">
                <div className="flex-1">
                  <label htmlFor="saved-team-name" className="block text-sm font-semibold text-gray-700">
                    보관 이름
                  </label>
                  <input
                    id="saved-team-name"
                    type="text"
                    value={saveName}
                    onChange={(e) => onSaveNameChange(e.target.value)}
                    disabled={isRouletteRunning}
                    placeholder="비워두면 날짜 기반 이름으로 저장됩니다"
                    className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={isRouletteRunning}
                    className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-football-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                    aria-live="polite"
                  >
                    {copyState === 'copied' ? '복사됨 ✓' : copyState === 'error' ? '복사 실패' : '클립보드 복사'}
                  </button>
                  <button
                    type="button"
                    onClick={onSaveScenario}
                    disabled={saving || isRouletteRunning}
                    className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl bg-football-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-football-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {isRouletteRunning ? '룰렛 진행 중' : saving ? '보관 중...' : '이 편성 보관'}
                  </button>
                </div>
              </div>

              <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {scenario.teams.map((team) => (
                  <section
                    key={team.teamNumber}
                    className="football-pitch-card overflow-hidden rounded-2xl border border-emerald-100"
                  >
                    <header className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/70 px-3 py-2">
                      <div>
                        <h3 className="text-sm font-bold text-emerald-900">{team.teamNumber}팀</h3>
                        <p className="text-[11px] text-emerald-700/80">
                          {team.members.length}명 · 티어합 {team.gradeSum}
                        </p>
                      </div>
                    </header>

                    <ul className="divide-y divide-emerald-50 bg-[radial-gradient(circle_at_top,_rgba(187,247,208,0.45),_rgba(255,255,255,0.95)_55%)]">
                      {team.members.map((member) => (
                        <li
                          key={member.id}
                          className="flex items-center justify-between gap-2 px-3 py-2"
                        >
                          <span className="min-w-0 truncate text-sm font-semibold text-gray-900">
                            {member.name}
                          </span>
                          <span className="shrink-0 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                            {getGradeGroup(member.grade)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
