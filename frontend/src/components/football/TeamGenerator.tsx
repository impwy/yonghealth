'use client';

import type { FootballMember, TeamScenario } from '@/types';
import { getGradeGroup } from '@/lib/teamGenerator';
import EmptyState from '@/components/ui/EmptyState';

interface TeamGeneratorProps {
  members: FootballMember[];
  teamCount: number;
  onTeamCountChange: (teamCount: number) => void;
  scenarios: TeamScenario[];
  onGenerate: () => void;
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
  const validationMessage = getValidationMessage(members.length, teamCount);
  const canGenerate = validationMessage === '';

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
        <div className="bg-[linear-gradient(135deg,#166534_0%,#15803d_45%,#166534_100%)] px-4 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                Match Builder
              </p>
              <h2 className="mt-1 text-lg font-bold">랜덤 팀 생성</h2>
              <p className="mt-1 text-sm text-emerald-100">
                등급별로 섞은 뒤 팀별로 균형 있게 나눕니다.
              </p>
            </div>
            <div className="rounded-xl bg-white/12 px-3 py-2 text-right backdrop-blur-sm">
              <p className="text-[11px] text-emerald-100">생성 시나리오</p>
              <p className="text-xl font-bold">3안</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="text-sm font-semibold text-emerald-900">편성 규칙</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['1등급', '2등급', '3등급', '4등급', '5등급', '6등급'].map((group) => (
                  <span
                    key={group}
                    className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-medium text-emerald-800"
                  >
                    {group}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-emerald-800/80">
                각 등급 안에서 먼저 무작위로 섞고, 시작 팀 위치를 바꿔가며 분배합니다.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <label htmlFor="team-count" className="block text-sm font-semibold text-gray-700">
                팀 수
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="team-count"
                  type="number"
                  min={2}
                  max={Math.max(members.length, 2)}
                  value={teamCount}
                  onChange={(e) => onTeamCountChange(Number(e.target.value) || 2)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-base font-semibold text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <span className="shrink-0 text-sm font-medium text-gray-500">팀</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                현재 회원 {members.length}명 기준으로 최소 2팀부터 생성할 수 있습니다.
              </p>
              {validationMessage && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  {validationMessage}
                </p>
              )}
              <button
                type="button"
                onClick={onGenerate}
                disabled={!canGenerate}
                className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-gray-300"
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
                action={canGenerate ? { label: '첫 편성 만들기', onClick: onGenerate } : undefined}
              />
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-3">
              {scenarios.map((scenario) => (
                <article
                  key={scenario.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
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
                                <p className="text-[11px] text-gray-500">{getGradeGroup(member.grade)}</p>
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
