'use client';

import { useState } from 'react';
import type { FootballMember } from '@/types';

interface MemberSelectorProps {
  members: FootballMember[];
  selectedMemberIds: number[];
  onToggleMember: (id: number) => void;
  onSelectAll: () => void;
  onClear: () => void;
}

const GRADE_COLORS: Record<number, string> = {
  1: 'border-yellow-300 bg-yellow-50',
  2: 'border-orange-300 bg-orange-50',
  3: 'border-blue-300 bg-blue-50',
  4: 'border-indigo-300 bg-indigo-50',
  5: 'border-green-300 bg-green-50',
  6: 'border-gray-300 bg-gray-50',
};

export default function MemberSelector({
  members,
  selectedMemberIds,
  onToggleMember,
  onSelectAll,
  onClear,
}: MemberSelectorProps) {
  const [expanded, setExpanded] = useState(true);
  const selectedIdSet = new Set(selectedMemberIds);
  const tierSummaries = [1, 2, 3, 4, 5, 6].map((grade) => ({
    grade,
    selectedCount: members.filter((member) => member.grade === grade && selectedIdSet.has(member.id)).length,
    totalCount: members.filter((member) => member.grade === grade).length,
  }));

  return (
    <section className="football-panel rounded-2xl p-4 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-football-700">
            Match Roster
          </p>
          <h2 className="mt-1 text-base font-bold text-gray-900">이번 경기 참가 멤버 선택</h2>
          <p className="mt-1 break-keep text-sm text-gray-600">
            등록된 회원 중 이번에 뛸 사람만 남기고 팀을 생성하세요.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-football-800 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            전체 선택
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            모두 해제
          </button>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            {expanded ? '선택창 접기' : '선택창 펼치기'}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-football-800 shadow-sm">
            선택 {selectedMemberIds.length}명
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
            등록 {members.length}명
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tierSummaries.map(({ grade, selectedCount, totalCount }) => (
            <span key={grade} className="football-chip rounded-full px-3 py-1 text-[11px] font-semibold">
              {grade}티어 {selectedCount}/{totalCount}명
            </span>
          ))}
        </div>
      </div>

      {expanded && (
        members.length === 0 ? (
          <div className="mt-4 flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 py-8 text-gray-400">
            <span className="mb-2 text-4xl">⚽</span>
            <p className="text-sm font-medium text-gray-500">등록된 회원이 없습니다</p>
            <p className="mt-1 text-xs text-gray-400">풋볼 관리 탭에서 회원을 먼저 등록해주세요</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => {
              const selected = selectedIdSet.has(member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => onToggleMember(member.id)}
                  aria-pressed={selected}
                  className={`football-member-card rounded-2xl border p-4 text-left transition ${
                    selected
                      ? 'border-football-700 bg-white shadow-[0_18px_30px_rgba(21,128,61,0.12)] ring-2 ring-emerald-200'
                      : 'border-gray-200 bg-gray-50/80 hover:border-emerald-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{member.name}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {selected ? '이번 경기 포함' : '이번 경기 제외'}
                      </p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${GRADE_COLORS[member.grade] || 'border-gray-200 bg-gray-100'}`}>
                      {member.grade}티어
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )
      )}
    </section>
  );
}
