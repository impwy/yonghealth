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
    <section className="football-panel rounded-2xl p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-football-700">
            Player Desk
          </p>
          <h2 className="mt-1 text-base font-bold text-gray-900">회원 등록</h2>
          <p className="mt-1 text-sm text-gray-600">
            이름과 티어만 입력하면 바로 편성 대상에 추가됩니다.
          </p>
        </div>
        <div className="min-w-[86px] rounded-2xl border border-emerald-200 bg-white/85 px-3 py-2 text-center shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-football-700">
            Roster
          </p>
          <p className="mt-1 text-sm font-bold text-gray-900">{members.length}명</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 입력"
            className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="w-28">
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">티어</label>
          <select
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <option key={g} value={g}>{g}티어</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="min-h-[44px] rounded-xl bg-football-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-football-800 active:bg-football-900 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {submitting ? '등록 중...' : '등록'}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((g) => (
          <span key={g} className="football-chip rounded-full px-2.5 py-1 text-[11px] font-semibold">
            {g}티어 개별 편성
          </span>
        ))}
      </div>

      {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
    </section>
  );
}
