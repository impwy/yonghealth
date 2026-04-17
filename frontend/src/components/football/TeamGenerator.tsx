'use client';

import { useEffect, useRef, useState } from 'react';
import type { FootballMember, TeamScenario } from '@/types';
import { formatTeamsForClipboard, getBalancedTeamSizes, getGradeGroup } from '@/lib/teamGenerator';
import EmptyState from '@/components/ui/EmptyState';

interface TeamGeneratorProps {
  members: FootballMember[];
  totalMemberCount: number;
  teamCount: number;
  onTeamCountChange: (teamCount: number) => void;
  scenario: TeamScenario | null;
  onGenerate: (teamCount: number) => void;
  saveName: string;
  onSaveNameChange: (value: string) => void;
  onSaveScenario: () => void;
  saving: boolean;
  lockedCount: number;
}

function getValidationMessage(memberCount: number, teamCount: number) {
  if (memberCount < 2) {
    return '회원이 2명 이상 있어야 팀을 만들 수 있습니다.';
  }

  if (teamCount < 2) {
    return '팀 수는 최소 2팀 이상이어야 합니다.';
  }

  if (teamCount > memberCount) {
    return '팀 수는 선택된 인원 수보다 많을 수 없습니다.';
  }

  return '';
}

export default function TeamGenerator({
  members,
  totalMemberCount,
  teamCount,
  onTeamCountChange,
  scenario,
  onGenerate,
  saveName,
  onSaveNameChange,
  onSaveScenario,
  saving,
  lockedCount,
}: TeamGeneratorProps) {
  const [teamCountInput, setTeamCountInput] = useState(String(teamCount));
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxTeamCount = Math.max(members.length, teamCount, 12);
  const validationMessage = getValidationMessage(members.length, teamCount);
  const canGenerate = validationMessage === '';
  const balancedTeamSizes = getBalancedTeamSizes(members.length, teamCount);

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

    const normalized = Math.max(Math.trunc(parsed), 2);
    onTeamCountChange(normalized);
    setTeamCountInput(String(normalized));
    return normalized;
  };

  const handleGenerateClick = () => {
    const nextTeamCount = commitTeamCount(teamCountInput);
    onGenerate(nextTeamCount);
  };

  const handleStepChange = (delta: number) => {
    const nextTeamCount = Math.min(Math.max(teamCount + delta, 2), maxTeamCount);
    onTeamCountChange(nextTeamCount);
    setTeamCountInput(String(nextTeamCount));
  };

  const handleCopy = async () => {
    if (!scenario) return;
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
              <h2 className="mt-1 break-keep text-lg font-bold">랜덤 팀 생성</h2>
              <p className="mt-1 max-w-xl break-keep text-sm leading-6 text-emerald-100">
                선택한 멤버를 티어가 균등하게 섞이도록 분배합니다. 고정된 멤버는 지정한 팀에 먼저 배치됩니다.
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
                각 티어를 가장 적게 가진 팀부터 먼저 배정해 팀 간 티어 차이를 최대 1명으로 맞춥니다.
              </p>
              <p className="mt-2 text-xs font-medium text-emerald-900">
                등록 {totalMemberCount}명 중 이번 경기 {members.length}명 선택
              </p>
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
                disabled={!canGenerate}
                className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-football-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-football-800 active:bg-football-900 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {scenario ? '다시 굴리기' : '랜덤 편성 생성'}
              </button>
            </div>
          </div>

          {!scenario ? (
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40">
              <EmptyState
                icon="🥅"
                title="편성 결과가 아직 없습니다"
                description="이번 경기 멤버를 선택하고 팀 수를 정한 뒤 랜덤 편성을 생성하세요."
                action={canGenerate ? { label: '첫 편성 만들기', onClick: handleGenerateClick } : undefined}
              />
            </div>
          ) : (
            <div className="space-y-4">
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
                    placeholder="비워두면 날짜 기반 이름으로 저장됩니다"
                    className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-football-800 transition hover:bg-emerald-50"
                    aria-live="polite"
                  >
                    {copyState === 'copied' ? '복사됨 ✓' : copyState === 'error' ? '복사 실패' : '클립보드 복사'}
                  </button>
                  <button
                    type="button"
                    onClick={onSaveScenario}
                    disabled={saving}
                    className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl bg-football-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-football-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {saving ? '보관 중...' : '이 편성 보관'}
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
