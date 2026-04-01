'use client';

import { useState } from 'react';
import type { FootballMember } from '@/types';
import { footballApi } from '@/lib/api';

interface MemberListProps {
  members: FootballMember[];
  onMemberDeleted: (id: number) => void;
}

const GRADE_COLORS: Record<number, string> = {
  1: 'border-l-yellow-500 bg-yellow-50',
  2: 'border-l-orange-500 bg-orange-50',
  3: 'border-l-blue-500 bg-blue-50',
  4: 'border-l-indigo-500 bg-indigo-50',
  5: 'border-l-green-500 bg-green-50',
  6: 'border-l-gray-500 bg-gray-50',
};

export default function MemberList({ members, onMemberDeleted }: MemberListProps) {
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await footballApi.deleteMember(id);
      onMemberDeleted(id);
    } catch {
      // 삭제 실패 시 무시
    } finally {
      setDeleting(null);
    }
  };

  return (
    <section className="football-panel rounded-2xl p-4 md:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-football-700">
            Squad List
          </p>
          <h2 className="mt-1 text-base font-bold text-gray-900">등록 회원</h2>
          <p className="mt-1 text-sm text-gray-600">
            티어별로 정렬된 현재 편성 후보 목록입니다.
          </p>
        </div>
        <div className="min-w-[86px] rounded-2xl border border-emerald-200 bg-white/85 px-3 py-2 text-center shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-football-700">
            Roster
          </p>
          <p className="mt-1 text-sm font-bold text-gray-900">{members.length}명</p>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 py-8 text-gray-400">
          <span className="text-4xl mb-2">⚽</span>
          <p className="text-sm font-medium text-gray-500">등록된 회원이 없습니다</p>
          <p className="text-xs text-gray-400 mt-1">위에서 회원을 등록해주세요</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((grade) => {
              const count = members.filter((member) => member.grade === grade).length;
              return (
                <span key={grade} className="football-chip rounded-full px-3 py-1 text-[11px] font-semibold">
                  {grade}티어 {count}명
                </span>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {members.map((member) => (
            <div
              key={member.id}
              className={`football-member-card relative rounded-xl border-l-4 p-3 ${GRADE_COLORS[member.grade] || 'border-l-gray-400 bg-gray-50'}`}
            >
              <button
                onClick={() => handleDelete(member.id)}
                disabled={deleting === member.id}
                className="absolute right-2 top-2 rounded-full border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] text-gray-400 transition hover:border-red-200 hover:text-red-500 disabled:opacity-50"
                aria-label={`${member.name} 삭제`}
              >
                ✕
              </button>
              <div className="pr-8">
                <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 shadow-sm">
                    {member.grade}티어
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      )}
    </section>
  );
}
