'use client';

import { useState } from 'react';
import type { FootballMember } from '@/types';
import { footballApi } from '@/lib/api';

interface MemberFormProps {
  members: FootballMember[];
  onMemberAdded: (member: FootballMember) => void;
}

export default function MemberForm({ members, onMemberAdded }: MemberFormProps) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(3);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('이름을 입력해주세요');
      return;
    }
    if (members.some((m) => m.name === trimmedName)) {
      setError('이미 등록된 이름입니다');
      return;
    }

    setSubmitting(true);
    try {
      const member = await footballApi.createMember({ name: trimmedName, grade });
      onMemberAdded(member);
      setName('');
      setGrade(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">회원 등록</h2>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs text-gray-500 mb-1">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 입력"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="w-24">
          <label className="block text-xs text-gray-500 mb-1">등급</label>
          <select
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <option key={g} value={g}>{g}등급</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 active:bg-green-800 transition disabled:opacity-50 min-h-[40px]"
        >
          {submitting ? '등록 중...' : '등록'}
        </button>
      </form>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}
