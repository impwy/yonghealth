'use client';

import { useState } from 'react';
import type { FootballSavedTeam } from '@/types';

interface SavedTeamsPanelProps {
  savedTeams: FootballSavedTeam[];
  onDelete: (id: number) => void;
  deletingId: number | null;
}

function formatCreatedAt(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function SavedTeamsPanel({ savedTeams, onDelete, deletingId }: SavedTeamsPanelProps) {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => (
      prev.includes(id) ? prev.filter((currentId) => currentId !== id) : [...prev, id]
    ));
  };

  return (
    <section className="football-panel rounded-2xl p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-football-700">
            Saved Match
          </p>
          <h2 className="mt-1 text-base font-bold text-gray-900">보관된 팀 편성</h2>
          <p className="mt-1 break-keep text-sm text-gray-600">
            랜덤으로 생성된 안 중 선택해서 저장한 팀 구성을 기록으로 남깁니다.
          </p>
        </div>
        <div className="min-w-[96px] rounded-2xl border border-emerald-200 bg-white/85 px-3 py-2 text-center shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-football-700">
            Saved
          </p>
          <p className="mt-1 text-sm font-bold text-gray-900">{savedTeams.length}건</p>
        </div>
      </div>

      {savedTeams.length === 0 ? (
        <div className="mt-4 flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 py-8 text-gray-400">
          <span className="mb-2 text-4xl">🗂️</span>
          <p className="text-sm font-medium text-gray-500">아직 보관된 팀이 없습니다</p>
          <p className="mt-1 text-xs text-gray-400">랜덤 편성안에서 원하는 팀을 저장해보세요</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {savedTeams.map((savedTeam) => {
            const expanded = expandedIds.includes(savedTeam.id);

            return (
              <article
                key={savedTeam.id}
                className="overflow-hidden rounded-2xl border border-emerald-100 bg-[linear-gradient(180deg,rgba(240,253,244,0.88),rgba(255,255,255,1))]"
              >
                <div className="flex flex-col gap-3 border-b border-emerald-100 px-4 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-football-700">
                      Saved Lineup
                    </p>
                    <h3 className="mt-1 text-sm font-bold text-gray-900">{savedTeam.name}</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatCreatedAt(savedTeam.createdAt)} · {savedTeam.teamCount}팀
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(savedTeam.id)}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-football-800 transition hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      {expanded ? '편성 접기' : '편성 보기'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(savedTeam.id)}
                      disabled={deletingId === savedTeam.id}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === savedTeam.id ? '삭제 중...' : '삭제'}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="grid gap-3 p-4 lg:grid-cols-2">
                    {savedTeam.teams.map((team) => (
                      <section
                        key={`${savedTeam.id}-${team.teamNumber}`}
                        className="rounded-xl border border-emerald-100 bg-white/90 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-emerald-900">{team.teamNumber}팀</h4>
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                            {team.members.length}명
                          </span>
                        </div>

                        <div className="mt-3 space-y-2">
                          {team.members.map((member, index) => (
                            <div
                              key={`${savedTeam.id}-${team.teamNumber}-${index}`}
                              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                            >
                              <p className="text-sm font-semibold text-gray-900">{member.memberName}</p>
                              <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-gray-700">
                                {member.memberGrade}티어
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
