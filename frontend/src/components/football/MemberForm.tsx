'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setName('');
    setGrade(3);
    setError('');
    setShowModal(false);
  };

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
      setShowModal(false);
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
            등록 창은 팝업으로 열리고, 저장 후 바로 편성 대상에 추가됩니다.
          </p>
        </div>
        <div className="min-w-[86px] rounded-2xl border border-emerald-200 bg-white/85 px-3 py-2 text-center shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-football-700">
            Roster
          </p>
          <p className="mt-1 text-sm font-bold text-gray-900">{members.length}명</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={openModal}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-football-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-football-800 active:bg-football-900"
        >
          + 회원 등록
        </button>
        <p className="text-xs text-gray-500">
          모바일에서는 등록 폼이 화면 위로 겹쳐 열려 목록 영역을 밀어내지 않습니다.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((g) => (
          <span key={g} className="football-chip rounded-full px-2.5 py-1 text-[11px] font-semibold">
            {g}티어 개별 편성
          </span>
        ))}
      </div>

      {showModal && typeof document !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 z-40 bg-black/45" onClick={closeModal} />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-emerald-100 bg-white shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:w-[440px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl">
            <div className="flex justify-center pt-2 pb-1 md:hidden">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-football-700">
                  Player Desk
                </p>
                <h3 className="mt-1 text-lg font-bold text-gray-900">회원 추가</h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-gray-400 transition hover:text-gray-600"
                aria-label="회원 등록 창 닫기"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름 입력"
                  autoFocus
                  className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-3 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">티어</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-3 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>{g}티어</option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pb-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex min-h-[46px] flex-1 items-center justify-center rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-[46px] flex-1 items-center justify-center rounded-xl bg-football-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-football-800 active:bg-football-900 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {submitting ? '등록 중...' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </>,
        document.body
      )}
    </section>
  );
}
