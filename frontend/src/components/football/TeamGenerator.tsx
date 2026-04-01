'use client';

import { useEffect, useState } from 'react';
import type { FootballMember, TeamScenario } from '@/types';
import { getGradeGroup } from '@/lib/teamGenerator';
import EmptyState from '@/components/ui/EmptyState';

interface TeamGeneratorProps {
  members: FootballMember[];
  teamCount: number;
  onTeamCountChange: (teamCount: number) => void;
  scenarios: TeamScenario[];
  onGenerate: (teamCount: number) => void;
}

function getValidationMessage(memberCount: number, teamCount: number) {
  if (memberCount < 2) {
    return '회원이 2명 이상 있어야 팀을 만들 수 있습니다.';
  }

  if (teamCount < 2) {
    return '팀 수는 최소 2팀 이상이어야 합니다.';
  }

  if (teamCount > memberCount) {
    return '팀 수는 전체 회원 수보다 많을 수 없습니다.';
  }

  return '';
}

export default function TeamGenerator({
  members,
  teamCount,
  onTeamCountChange,
  scenarios,
  onGenerate,
}: TeamGeneratorProps) {
  const [teamCountInput, setTeamCountInput] = useState(String(teamCount));
  const maxTeamCount = Math.max(members.length, teamCount, 12);
  const validationMessage = getValidationMessage(members.length, teamCount);
  const canGenerate = validationMessage === '';

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
                등급별로 섞은 뒤 팀별로 균형 있게 분배합니다.
              </p>
            </div>
            <div className="football-panel-dark self-start rounded-xl px-3 py-2 text-right md:min-w-[132px]">
              <p className="whitespace-nowrap text-[11px] text-emerald-100">생성안</p>
              <p className="whitespace-nowrap text-xl font-bold">3개</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-sm font-semibold text-emerald-900">편성 규칙</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['1등급', '2등급', '3등급', '4등급', '5등급', '6등급'].map((group) => (
                  <span
                    key={group}
                    className="football-chip rounded-full px-2.5 py-1 text-xs font-medium"
                  >
                    {group}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-emerald-800/80">
                각 등급 안에서 먼저 무작위로 섞고, 시작 팀 위치를 바꿔가며 분배합니다.
                3등급과 4등급도 서로 합치지 않고 독립적으로 처리합니다.
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
                원하는 팀 수를 먼저 정해둘 수 있고, 회원 수보다 많으면 생성 시 안내합니다.
              </p>
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
                description="회원을 등록하고 팀 수를 정한 뒤 랜덤 편성을 생성하세요."
                action={canGenerate ? { label: '첫 편성 만들기', onClick: handleGenerateClick } : undefined}
              />
            </div>
          ) : (
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
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {scenario.teams.length}팀
                    </span>
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
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                                <p className="text-[11px] text-gray-500">{getGradeGroup(member.grade)} 풀</p>
                              </div>
                              <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700">
                                {member.grade}등급
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
          )}
        </div>
      </div>
    </section>
  );
}
