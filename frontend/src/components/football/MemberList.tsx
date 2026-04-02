'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { FootballMember } from '@/types';
import { footballApi } from '@/lib/api';

interface MemberListProps {
  members: FootballMember[];
  onMemberUpdated: (member: FootballMember) => void;
  onMemberDeleted: (id: number) => void;
  defaultExpanded?: boolean;
}

const GRADE_COLORS: Record<number, string> = {
  1: 'border-l-yellow-500 bg-yellow-50',
  2: 'border-l-orange-500 bg-orange-50',
  3: 'border-l-blue-500 bg-blue-50',
  4: 'border-l-indigo-500 bg-indigo-50',
  5: 'border-l-green-500 bg-green-50',
  6: 'border-l-gray-500 bg-gray-50',
};

export default function MemberList({
  members,
  onMemberUpdated,
  onMemberDeleted,
  defaultExpanded = false,
}: MemberListProps) {
  const [deleting, setDeleting] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [editingMember, setEditingMember] = useState<FootballMember | null>(null);
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState(3);
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);
  const tierSummaries = [1, 2, 3, 4, 5, 6].map((grade) => ({
    grade,
    count: members.filter((member) => member.grade === grade).length,
  }));

  const openEditModal = (member: FootballMember) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditGrade(member.grade);
    setEditError('');
  };

  const closeEditModal = () => {
    if (saving) {
      return;
    }

    setEditingMember(null);
    setEditName('');
    setEditGrade(3);
    setEditError('');
  };

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) {
      return;
    }

    const trimmedName = editName.trim();
    if (!trimmedName) {
      setEditError('이름을 입력해주세요');
      return;
    }

    if (members.some((member) => member.id !== editingMember.id && member.name === trimmedName)) {
      setEditError('이미 등록된 이름입니다');
      return;
    }

    setSaving(true);
    try {
      const updatedMember = await footballApi.updateMember(editingMember.id, {
        name: trimmedName,
        grade: editGrade,
      });
      onMemberUpdated(updatedMember);
      closeEditModal();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : '수정에 실패했습니다');
    } finally {
      setSaving(false);
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
        </div>
        <div className="min-w-[86px] rounded-2xl border border-emerald-200 bg-white/85 px-3 py-2 text-center shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-football-700">
            Roster
          </p>
          <p className="mt-1 text-sm font-bold text-gray-900">{members.length}명</p>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-football-700">
              Roster Summary
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              전체 {members.length}명
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {expanded ? '회원 목록이 펼쳐져 있습니다.' : '회원 목록은 접혀 있고 요약만 보이는 상태입니다.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-football-800 transition hover:border-emerald-300 hover:bg-emerald-50"
            aria-expanded={expanded}
          >
            {expanded ? '회원 목록 가리기' : '회원 목록 보기'}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tierSummaries.map(({ grade, count }) => (
            <span key={grade} className="football-chip rounded-full px-3 py-1 text-[11px] font-semibold">
              {grade}티어 {count}명
            </span>
          ))}
        </div>
      </div>

      {expanded && (
        members.length === 0 ? (
          <div className="mt-4 flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 py-8 text-gray-400">
            <span className="mb-2 text-4xl">⚽</span>
            <p className="text-sm font-medium text-gray-500">등록된 회원이 없습니다</p>
            <p className="mt-1 text-xs text-gray-400">위에서 회원을 등록해주세요</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <div
                key={member.id}
                className={`football-member-card relative rounded-xl border-l-4 p-3 ${GRADE_COLORS[member.grade] || 'border-l-gray-400 bg-gray-50'}`}
              >
                <div className="pr-8">
                  <p className="truncate text-sm font-semibold text-gray-900">{member.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 shadow-sm">
                      {member.grade}티어
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(member)}
                    className="inline-flex min-h-[36px] items-center justify-center rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-football-800 transition hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(member.id)}
                    disabled={deleting === member.id}
                    className="inline-flex min-h-[36px] items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:text-red-500 disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {editingMember && typeof document !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 z-40 bg-black/45" onClick={closeEditModal} />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-emerald-100 bg-white shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:w-[440px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl">
            <div className="flex justify-center pb-1 pt-2 md:hidden">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-football-700">
                  Roster Edit
                </p>
                <h3 className="mt-1 text-lg font-bold text-gray-900">회원 수정</h3>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-gray-400 transition hover:text-gray-600"
                aria-label="회원 수정 창 닫기"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 px-5 py-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">이름</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-3 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">티어</label>
                <select
                  value={editGrade}
                  onChange={(e) => setEditGrade(Number(e.target.value))}
                  className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-3 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {[1, 2, 3, 4, 5, 6].map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}티어
                    </option>
                  ))}
                </select>
              </div>

              {editError && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  {editError}
                </p>
              )}

              <div className="flex gap-3 pb-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="inline-flex min-h-[46px] flex-1 items-center justify-center rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-[46px] flex-1 items-center justify-center rounded-xl bg-football-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-football-800 active:bg-football-900 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {saving ? '수정 중...' : '저장하기'}
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
