'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FootballMember, TeamScenario } from '@/types';
import { footballApi } from '@/lib/api';
import { generateScenarios } from '@/lib/teamGenerator';
import MemberForm from './MemberForm';
import MemberList from './MemberList';
import TeamGenerator from './TeamGenerator';

export default function FootballPage() {
  const [members, setMembers] = useState<FootballMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [scenarios, setScenarios] = useState<TeamScenario[]>([]);
  const [teamCount, setTeamCount] = useState(2);

  const fetchMembers = useCallback(async () => {
    try {
      const data = await footballApi.getMembers();
      setMembers(data);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleMemberAdded = (member: FootballMember) => {
    setMembers((prev) => [...prev, member].sort((a, b) => a.grade - b.grade || a.name.localeCompare(b.name)));
  };

  const handleMemberDeleted = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleGenerate = () => {
    const result = generateScenarios(members, teamCount, 3);
    setScenarios(result);
  };

  const gradeSummaries = [1, 2, 3, 4, 5, 6].map((grade) => ({
    grade,
    count: members.filter((member) => member.grade === grade).length,
  }));

  if (loading) {
    return (
      <div className="space-y-4 pb-6">
        <div className="h-44 rounded-3xl bg-gray-200 animate-pulse" />
        <div className="h-40 rounded-2xl bg-gray-200 animate-pulse" />
        <div className="h-72 rounded-2xl bg-gray-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <section className="football-shell rounded-3xl px-5 py-5 text-white md:px-6 md:py-6">
        <div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-emerald-50 uppercase">
              Football Mode
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight md:text-3xl">
              풋볼 팀 편성 보드
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/90 md:text-base">
              회원을 등록하고 등급별로 랜덤 셔플한 뒤 여러 편성안을 바로 비교할 수 있습니다.
              3등급과 4등급은 각각 독립된 풀로 나눠 편성합니다.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="football-panel-dark rounded-full px-3 py-1 text-xs font-semibold text-white">
                전체 회원 {members.length}명
              </span>
              <span className="football-panel-dark rounded-full px-3 py-1 text-xs font-semibold text-white">
                현재 팀 수 {teamCount}팀
              </span>
              <span className="football-panel-dark rounded-full px-3 py-1 text-xs font-semibold text-white">
                랜덤 시나리오 {scenarios.length || 3}안
              </span>
            </div>
          </div>

          <div className="football-panel-dark rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
              Squad Status
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {gradeSummaries.map(({ grade, count }) => (
                <div key={grade} className="rounded-xl bg-white/10 px-3 py-2 text-center">
                  <p className="text-[11px] text-emerald-100">{grade}등급</p>
                  <p className="mt-1 text-lg font-bold">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {loadError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          풋볼 회원 API 연결에 실패했습니다. 백엔드가 내려가 있으면 목록은 비어 보일 수 있지만,
          서버가 다시 올라오면 새로고침 후 정상 동작합니다.
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <MemberForm members={members} onMemberAdded={handleMemberAdded} />
        <MemberList members={members} onMemberDeleted={handleMemberDeleted} />
      </div>

      <TeamGenerator
        members={members}
        teamCount={teamCount}
        onTeamCountChange={setTeamCount}
        scenarios={scenarios}
        onGenerate={handleGenerate}
      />
    </div>
  );
}
