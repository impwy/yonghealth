'use client';

import { useEffect, useState } from 'react';
import type { Workout } from '@/types';
import { workoutApi } from '@/lib/api';
import WorkoutCard from '@/components/WorkoutCard';
import Toast from '@/components/ui/Toast';

export default function HomePage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const data = dateFilter
        ? await workoutApi.getByDate(dateFilter)
        : await workoutApi.getAll();
      setWorkouts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [dateFilter]);

  return (
    <div>
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">운동 기록</h1>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {dateFilter && (
        <button
          onClick={() => setDateFilter('')}
          className="mb-4 text-sm text-blue-600 hover:underline"
        >
          전체 보기
        </button>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">불러오는 중...</div>
      ) : workouts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">운동 기록이 없습니다</p>
          <p className="text-sm">상단의 &quot;새 운동 기록&quot; 버튼을 눌러 시작하세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      )}
    </div>
  );
}
