'use client';

import { useState } from 'react';
import type { FootballMember } from '@/types';
import { getGradeGroup } from '@/lib/teamGenerator';
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
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">등록 회원</h2>
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
          {members.length}명
        </span>
      </div>

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <span className="text-4xl mb-2">⚽</span>
          <p className="text-sm font-medium text-gray-500">등록된 회원이 없습니다</p>
          <p className="text-xs text-gray-400 mt-1">위에서 회원을 등록해주세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {members.map((member) => (
            <div
              key={member.id}
              className={`relative border-l-4 rounded-lg p-2.5 ${GRADE_COLORS[member.grade] || 'border-l-gray-400 bg-gray-50'}`}
            >
              <button
                onClick={() => handleDelete(member.id)}
                disabled={deleting === member.id}
                className="absolute top-1 right-1 text-gray-300 hover:text-red-400 text-xs transition"
                aria-label={`${member.name} 삭제`}
              >
                ✕
              </button>
              <p className="text-sm font-semibold text-gray-800 truncate pr-4">{member.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs text-gray-500">{member.grade}등급</span>
                <span className="text-[10px] text-gray-400">({getGradeGroup(member.grade)})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
