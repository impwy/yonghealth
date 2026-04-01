'use client';

import { useEffect, useState } from 'react';
import type { FootballMember, TeamScenario } from '@/types';
import { getBalancedTeamSizes, getGradeGroup } from '@/lib/teamGenerator';
import EmptyState from '@/components/ui/EmptyState';

interface TeamGeneratorProps {
  members: FootballMember[];
  totalMemberCount: number;
  teamCount: number;
  onTeamCountChange: (teamCount: number) => void;
  scenarios: TeamScenario[];
  onGenerate: (teamCount: number) => void;
  saveName: string;
  onSaveNameChange: (value: string) => void;
  onSaveScenario: (scenario: TeamScenario) => void;
  savingScenarioId: number | null;
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
  scenarios,
  onGenerate,
  saveName,
  onSaveNameChange,
  onSaveScenario,
  savingScenarioId,
}: TeamGeneratorProps) {
  const [teamCountInput, setTeamCountInput] = useState(String(teamCount));
  const maxTeamCount = Math.max(members.length, teamCount, 12);
  const validationMessage = getValidationMessage(members.length, teamCount);
  const canGenerate = validationMessage === '';
  const balancedTeamSizes = getBalancedTeamSizes(members.length, teamCount);

  useEffect(() => {
    setTeamCountInput(String(teamCount));
  }, [teamCount]);

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

  return (
    <section className="space-y-4">
      <div className="football-panel overflow-hidden rounded-2xl">
        <div className="football-shell px-4 py-4 text-white md:px-5">
          <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                Match Builder
              </p>
              <h2 className="mt-1 break-keep text-lg font-bold">랜덤 팀 생성</h2>
              <p className="mt-1 max-w-xl break-keep text-sm leading-6 text-emerald-100">
                이번 경기로 선택한 멤버만 티어별로 섞고, 팀 인원 수가 최대한 균등해지도록 분배합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-sm font-semibold text-emerald-900">편성 규칙</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['1티어', '2티어', '3티어', '4티어', '5티어', '6티어'].map((group) => (
                  <span
                    key={group}
                    className="football-chip rounded-full px-2.5 py-1 text-xs font-medium"
                  >
                    {group}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-emerald-800/80">
                각 티어 안에서 먼저 무작위로 섞고, 10명이면 5대5, 9명이면 5대4처럼
                전체 인원 수가 최대한 균등해지도록 분배합니다.
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
              <p className="mt-2 text-xs text-gray-500">
                원하는 팀 수를 먼저 정해둘 수 있고, 선택된 인원보다 많으면 생성 시 안내합니다.
              </p>
              {balancedTeamSizes.length > 0 && (
                <p className="mt-2 text-xs font-medium text-football-800">
                  현재 {members.length}명 기준 예상 인원: {balancedTeamSizes.map((size) => `${size}명`).join(' / ')}
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
                랜덤 편성 생성
              </button>
            </div>
          </div>

          {scenarios.length === 0 ? (
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
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <label htmlFor="saved-team-name" className="block text-sm font-semibold text-gray-700">
                  보관 이름
                </label>
                <input
                  id="saved-team-name"
                  type="text"
                  value={saveName}
                  onChange={(e) => onSaveNameChange(e.target.value)}
                  placeholder="비워두면 날짜 기반 이름으로 저장됩니다"
                  className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-3 py-3 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <p className="mt-2 text-xs text-gray-500">
                  원하는 편성안에서 보관 버튼을 누르면 이 이름으로 저장합니다.
                </p>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                {scenarios.map((scenario) => (
                  <article
                    key={scenario.id}
                    className="football-pitch-card overflow-hidden rounded-2xl"
                  >
                    <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/70 px-4 py-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                          Scenario {scenario.id}
                        </p>
                        <h3 className="mt-1 text-sm font-bold text-gray-900">
                          랜덤 편성안 {scenario.id}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          {scenario.teams.length}팀
                        </span>
                        <button
                          type="button"
                          onClick={() => onSaveScenario(scenario)}
                          disabled={savingScenarioId !== null}
                          className="inline-flex min-h-[36px] items-center justify-center rounded-full bg-football-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-football-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {savingScenarioId === scenario.id ? '보관 중...' : '이 안 보관'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 p-4">
                      {scenario.teams.map((team) => (
                        <section
                          key={team.teamNumber}
                          className="rounded-xl border border-emerald-100 bg-[radial-gradient(circle_at_top,_rgba(187,247,208,0.45),_rgba(255,255,255,0.95)_55%)] p-3"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-emerald-900">{team.teamNumber}팀</h4>
                            <span className="rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                              {team.members.length}명
                            </span>
                          </div>

                          <div className="mt-3 space-y-2">
                            {team.members.map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center justify-between rounded-lg border border-white/80 bg-white/85 px-3 py-2 shadow-[0_6px_16px_rgba(22,101,52,0.08)]"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                                </div>
                                <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700">
                                  {getGradeGroup(member.grade)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
