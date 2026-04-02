'use client';

import { useEffect, useState } from 'react';
import type { FootballMember } from '@/types';
import { footballApi } from '@/lib/api';
import MemberForm from './MemberForm';
import MemberList from './MemberList';

function sortMembers(members: FootballMember[]) {
  return [...members].sort((a, b) => a.grade - b.grade || a.name.localeCompare(b.name));
}

export default function FootballManagementPage() {
  const [members, setMembers] = useState<FootballMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await footballApi.getMembers();
        setMembers(sortMembers(data));
        setLoadError(null);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : '풋볼 API 연결에 실패했습니다');
      } finally {
        setLoading(false);
      }
    };

    void fetchMembers();
  }, []);

  const handleMemberAdded = (member: FootballMember) => {
    setMembers((prev) => sortMembers([...prev, member]));
  };

  const handleMemberUpdated = (member: FootballMember) => {
    setMembers((prev) => sortMembers(prev.map((current) => (
      current.id === member.id ? member : current
    ))));
  };

  const handleMemberDeleted = (id: number) => {
    setMembers((prev) => prev.filter((member) => member.id !== id));
  };

  const gradeSummaries = [1, 2, 3, 4, 5, 6].map((grade) => ({
    grade,
    count: members.filter((member) => member.grade === grade).length,
  }));

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-44 animate-pulse rounded-3xl bg-gray-200" />
        <div className="h-52 animate-pulse rounded-2xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="football-shell rounded-3xl px-5 py-5 text-white md:px-6 md:py-6">
        <div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50">
              Football Management
            </div>
            <h1 className="mt-4 break-keep text-2xl font-black tracking-tight md:text-3xl">
              풋볼 회원 명단을 관리합니다
            </h1>
            <p className="mt-2 max-w-2xl break-keep text-sm leading-6 text-emerald-50/90 md:text-base">
              회원 등록, 수정, 삭제는 이 화면에서만 관리하고, 팀 생성 화면에서는 이번 경기 참가자만 선택하도록 분리했습니다.
            </p>
          </div>

          <div className="football-panel-dark rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
              Roster Status
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {gradeSummaries.map(({ grade, count }) => (
                <div key={grade} className="rounded-xl bg-white/10 px-3 py-2 text-center">
                  <p className="text-[11px] text-emerald-100">{grade}티어</p>
                  <p className="mt-1 text-lg font-bold">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {loadError && (
        <div className="break-keep rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          풋볼 회원 API 연결에 실패했습니다: {loadError}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <MemberForm members={members} onMemberAdded={handleMemberAdded} />
        <MemberList
          members={members}
          onMemberUpdated={handleMemberUpdated}
          onMemberDeleted={handleMemberDeleted}
          defaultExpanded
        />
      </div>
    </div>
  );
}
