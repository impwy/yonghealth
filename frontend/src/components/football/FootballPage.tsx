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
  const [scenarios, setScenarios] = useState<TeamScenario[]>([]);
  const [teamCount, setTeamCount] = useState(2);

  const fetchMembers = useCallback(async () => {
    try {
      const data = await footballApi.getMembers();
      setMembers(data);
    } catch {
      // 서버 미연결 시 빈 배열 유지
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

  if (loading) {
    return (
      <div className="space-y-4 pb-4">
        <div className="h-16 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-white shadow-md">
        <h1 className="text-lg font-bold flex items-center gap-2">
          ⚽ 풋볼 팀 편성
        </h1>
        <p className="text-green-100 text-sm mt-1">회원을 등록하고 랜덤 팀을 생성하세요</p>
      </div>

      {/* 회원 등록 */}
      <MemberForm members={members} onMemberAdded={handleMemberAdded} />

      {/* 회원 목록 */}
      <MemberList members={members} onMemberDeleted={handleMemberDeleted} />

      {/* 팀 생성 */}
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
