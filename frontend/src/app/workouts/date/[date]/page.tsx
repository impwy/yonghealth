'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { WorkoutDateSummary } from '@/types';
import { workoutApi } from '@/lib/api';
import Toast from '@/components/ui/Toast';

export default function WorkoutDatePage() {
  const params = useParams();
  const date = params.date as string;
  const [workouts, setWorkouts] = useState<WorkoutDateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      try {
        const data = await workoutApi.getDateSummary(date);
        setWorkouts(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : '데이터를 불러올 수 없습니다');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, [date]);

  const formatDate = (d: string) => {
    const [y, m, day] = d.split('-');
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const dateObj = new Date(+y, +m - 1, +day);
    return `${y}년 ${+m}월 ${+day}일 (${weekDays[dateObj.getDay()]})`;
  };

  return (
    <div className="pb-16 md:pb-0">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4">
        &larr; 달력으로
      </Link>

      <h1 className="text-xl font-bold mb-4">{formatDate(date)}</h1>

      {loading ? (
        <div className="text-center py-20 text-gray-400">불러오는 중...</div>
      ) : workouts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">이 날의 운동 기록이 없습니다</p>
          <Link
            href={`/workouts/new?date=${date}`}
            className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold active:bg-blue-700 transition min-h-[48px]"
          >
            + 운동 기록 추가
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {workouts.map((w) => (
              <Link
                key={w.id}
                href={`/workouts/${w.id}`}
                className="block bg-white rounded-lg border border-gray-200 p-4 active:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {w.startTime}{w.endTime ? ` ~ ${w.endTime}` : ''}
                    </p>
                    {w.memo && (
                      <p className="text-sm text-gray-500 mt-1">{w.memo}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <p>종목 {w.exerciseCount}개</p>
                    <p>세트 {w.totalSets}개</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-4">
            <Link
              href={`/workouts/new?date=${date}`}
              className="block w-full py-3 bg-blue-600 text-white rounded-lg font-semibold text-center active:bg-blue-700 transition min-h-[48px]"
            >
              + 운동 기록 추가
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
