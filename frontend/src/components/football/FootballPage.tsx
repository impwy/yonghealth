'use client';

import { useEffect, useState } from 'react';
import type {
  FootballMember,
  FootballSavedTeam,
  LockedAssignments,
  RoulettePlan,
  RouletteSpinPhase,
  TeamScenario,
} from '@/types';
import { footballApi } from '@/lib/api';
import { buildRoulettePlan, generateScenarios } from '@/lib/teamGenerator';
import MemberSelector from './MemberSelector';
import SavedTeamsPanel from './SavedTeamsPanel';
import TeamGenerator from './TeamGenerator';

const ROULETTE_SPIN_DURATION_MS = 2200;
const ROULETTE_SETTLE_DURATION_MS = 800;

function sortMembers(members: FootballMember[]) {
  return [...members].sort((a, b) => a.grade - b.grade || a.name.localeCompare(b.name));
}

function buildDefaultSaveName(teamCount: number) {
  const now = new Date();
  const date = now.toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
  }).replace(/\./g, '').trim().replace(' ', '.');
  const time = now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${date} ${time} ${teamCount}팀 편성`;
}

function pruneLocks(locks: LockedAssignments, maxTeamCount: number, validMemberIds: Set<number>): LockedAssignments {
  const next: LockedAssignments = {};
  for (const [idStr, team] of Object.entries(locks)) {
    const id = Number(idStr);
    if (!validMemberIds.has(id)) continue;
    if (team < 0 || team >= maxTeamCount) continue;
    next[id] = team;
  }
  return next;
}

export default function FootballPage() {
  const [members, setMembers] = useState<FootballMember[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [savedTeams, setSavedTeams] = useState<FootballSavedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [savedTeamsError, setSavedTeamsError] = useState<string | null>(null);
  const [scenario, setScenario] = useState<TeamScenario | null>(null);
  const [teamCount, setTeamCount] = useState(2);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState<number | null>(null);
  const [lockedAssignments, setLockedAssignments] = useState<LockedAssignments>({});
  const [roulettePlan, setRoulettePlan] = useState<RoulettePlan | null>(null);
  const [rouletteStepIndex, setRouletteStepIndex] = useState(0);
  const [roulettePhase, setRoulettePhase] = useState<RouletteSpinPhase>('idle');


  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = sortMembers(await footballApi.getMembers());
        setMembers(data);
        setSelectedMemberIds(data.map((member) => member.id));
        setMembersError(null);
      } catch (error) {
        setMembersError(error instanceof Error ? error.message : '풋볼 API 연결에 실패했습니다');
      } finally {
        setLoading(false);
      }
    };

    const fetchSavedTeams = async () => {
      try {
        const data = await footballApi.getSavedTeams();
        setSavedTeams(data);
        setSavedTeamsError(null);
      } catch (error) {
        setSavedTeamsError(error instanceof Error ? error.message : '보관 팀을 불러오지 못했습니다');
      }
    };

    void fetchMembers();
    void fetchSavedTeams();
  }, []);

  const selectedMembers = members.filter((member) => selectedMemberIds.includes(member.id));

  const gradeSummaries = [1, 2, 3, 4, 5, 6].map((grade) => ({
    grade,
    selectedCount: selectedMembers.filter((member) => member.grade === grade).length,
    totalCount: members.filter((member) => member.grade === grade).length,
  }));

  const resetScenario = () => {
    setScenario(null);
    setRoulettePlan(null);
    setRouletteStepIndex(0);
    setRoulettePhase('idle');
  };

  useEffect(() => {
    if (!roulettePlan || roulettePhase === 'idle') return;

    const activeStep = roulettePlan.steps[rouletteStepIndex];
    if (!activeStep) {
      setScenario({ id: 1, teams: roulettePlan.finalTeams });
      setRoulettePhase('idle');
      return;
    }

    const timeout = setTimeout(() => {
      if (roulettePhase === 'spinning') {
        setScenario({ id: 1, teams: activeStep.teams });
        setRoulettePhase('settled');
        return;
      }

      const nextStepIndex = rouletteStepIndex + 1;
      if (nextStepIndex >= roulettePlan.steps.length) {
        setScenario({ id: 1, teams: roulettePlan.finalTeams });
        setRoulettePhase('idle');
        return;
      }

      setRouletteStepIndex(nextStepIndex);
      setRoulettePhase('spinning');
    }, roulettePhase === 'spinning' ? ROULETTE_SPIN_DURATION_MS : ROULETTE_SETTLE_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [roulettePhase, roulettePlan, rouletteStepIndex]);

  const handleToggleMember = (id: number) => {
    setSelectedMemberIds((prev) => {
      const isDeselecting = prev.includes(id);
      if (isDeselecting) {
        setLockedAssignments((locks) => {
          if (!(id in locks)) return locks;
          const next = { ...locks };
          delete next[id];
          return next;
        });
        return prev.filter((memberId) => memberId !== id);
      }
      return [...prev, id];
    });
    resetScenario();
  };

  const handleSelectAllMembers = () => {
    setSelectedMemberIds(members.map((member) => member.id));
    resetScenario();
  };

  const handleClearSelection = () => {
    setSelectedMemberIds([]);
    setLockedAssignments({});
    resetScenario();
  };

  const handleTeamCountChange = (next: number) => {
    setTeamCount(next);
    setLockedAssignments((prev) => pruneLocks(prev, next, new Set(selectedMemberIds)));
    resetScenario();
  };

  const handleLockChange = (memberId: number, team: number | null) => {
    setLockedAssignments((prev) => {
      const next = { ...prev };
      if (team === null) {
        delete next[memberId];
      } else {
        next[memberId] = team;
      }
      return next;
    });
    resetScenario();
  };

  const handleGenerate = (nextTeamCount: number) => {
    const prunedLocks = pruneLocks(lockedAssignments, nextTeamCount, new Set(selectedMemberIds));
    if (prunedLocks !== lockedAssignments) {
      setLockedAssignments(prunedLocks);
    }
    setRoulettePlan(null);
    setRouletteStepIndex(0);
    setRoulettePhase('idle');
    const [result] = generateScenarios(selectedMembers, nextTeamCount, 1, prunedLocks);
    setScenario(result ?? null);
  };

  const handleGenerateRoulette = (nextTeamCount: number) => {
    const prunedLocks = pruneLocks(lockedAssignments, nextTeamCount, new Set(selectedMemberIds));
    if (prunedLocks !== lockedAssignments) {
      setLockedAssignments(prunedLocks);
    }

    const plan = buildRoulettePlan(selectedMembers, nextTeamCount, prunedLocks);
    setRoulettePlan(plan);
    setRouletteStepIndex(0);
    setScenario({ id: 1, teams: plan.initialTeams });

    if (plan.steps.length === 0) {
      setScenario({ id: 1, teams: plan.finalTeams });
      setRoulettePhase('idle');
      return;
    }

    setRoulettePhase('spinning');
  };

  const handleSaveScenario = async () => {
    if (!scenario) return;
    setSaving(true);
    try {
      const savedTeam = await footballApi.saveTeam({
        name: saveName.trim() || buildDefaultSaveName(scenario.teams.length),
        teams: scenario.teams.map((team) => ({
          teamNumber: team.teamNumber,
          members: team.members.map((member) => ({
            memberId: member.id,
            memberName: member.name,
            memberGrade: member.grade,
          })),
        })),
      });

      setSavedTeams((prev) => [savedTeam, ...prev]);
      setSavedTeamsError(null);
      setSaveName('');
    } catch (error) {
      setSavedTeamsError(error instanceof Error ? error.message : '팀 보관에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSavedTeam = async (id: number) => {
    if (!confirm('이 보관 팀을 삭제하시겠습니까?')) return;

    setDeletingTeamId(id);
    try {
      await footballApi.deleteSavedTeam(id);
      setSavedTeams((prev) => prev.filter((team) => team.id !== id));
      setSavedTeamsError(null);
    } catch (error) {
      setSavedTeamsError(error instanceof Error ? error.message : '보관 팀 삭제에 실패했습니다');
    } finally {
      setDeletingTeamId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-44 animate-pulse rounded-3xl bg-gray-200" />
        <div className="h-52 animate-pulse rounded-2xl bg-gray-200" />
        <div className="h-80 animate-pulse rounded-2xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="football-shell rounded-3xl px-5 py-5 text-white md:px-6 md:py-6">
        <div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50">
              Match Builder
            </div>
            <h1 className="mt-4 break-keep text-2xl font-black tracking-tight md:text-3xl">
              오늘 뛸 멤버만 골라 팀을 만듭니다
            </h1>
            <p className="mt-2 max-w-2xl break-keep text-sm leading-6 text-emerald-50/90 md:text-base">
              저장된 회원 명단에서 이번 경기 참가자만 선택하고, 티어가 균등하게 섞인 랜덤 편성을 바로 보관할 수 있습니다.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="football-panel-dark rounded-full px-3 py-1 text-xs font-semibold text-white">
                등록 회원 {members.length}명
              </span>
              <span className="football-panel-dark rounded-full px-3 py-1 text-xs font-semibold text-white">
                이번 경기 {selectedMembers.length}명
              </span>
              <span className="football-panel-dark rounded-full px-3 py-1 text-xs font-semibold text-white">
                보관 팀 {savedTeams.length}건
              </span>
            </div>
          </div>

          <div className="football-panel-dark rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
              Match Status
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {gradeSummaries.map(({ grade, selectedCount, totalCount }) => (
                <div key={grade} className="rounded-xl bg-white/10 px-3 py-2 text-center">
                  <p className="text-[11px] text-emerald-100">{grade}티어</p>
                  <p className="mt-1 text-lg font-bold">{selectedCount}</p>
                  <p className="text-[11px] text-emerald-100/80">/ {totalCount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {membersError && (
        <div className="break-keep rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          풋볼 회원 API 연결에 실패했습니다: {membersError}
          {' '}
          배포 반영이 덜 되었거나 Neon DB에 `football_member` 테이블이 없는 경우 이 메시지가 보일 수 있습니다.
        </div>
      )}

      <MemberSelector
        members={members}
        selectedMemberIds={selectedMemberIds}
        onToggleMember={handleToggleMember}
        onSelectAll={handleSelectAllMembers}
        onClear={handleClearSelection}
        teamCount={teamCount}
        lockedAssignments={lockedAssignments}
        onLockChange={handleLockChange}
      />

      <TeamGenerator
        members={selectedMembers}
        totalMemberCount={members.length}
        teamCount={teamCount}
        onTeamCountChange={handleTeamCountChange}
        scenario={scenario}
        onGenerate={handleGenerate}
        onGenerateRoulette={handleGenerateRoulette}
        saveName={saveName}
        onSaveNameChange={setSaveName}
        onSaveScenario={handleSaveScenario}
        saving={saving}
        lockedCount={Object.keys(lockedAssignments).length}
        roulettePlan={roulettePlan}
        rouletteStepIndex={rouletteStepIndex}
        roulettePhase={roulettePhase}
      />

      {savedTeamsError && (
        <div className="break-keep rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          보관 팀 영역을 불러오지 못했습니다: {savedTeamsError}
          {' '}
          새로 추가된 보관 팀 테이블이 아직 Neon에 없으면 이 메시지가 보일 수 있습니다.
        </div>
      )}

      <SavedTeamsPanel savedTeams={savedTeams} onDelete={handleDeleteSavedTeam} deletingId={deletingTeamId} />
    </div>
  );
}
