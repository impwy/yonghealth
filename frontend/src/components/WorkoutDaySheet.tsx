'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import type { WorkoutDateSummary } from '@/types';
import { workoutApi } from '@/lib/api';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';

interface WorkoutDaySheetProps {
  date: string;
  onClose: () => void;
}

export default function WorkoutDaySheet({ date, onClose }: WorkoutDaySheetProps) {
  const [workouts, setWorkouts] = useState<WorkoutDateSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await workoutApi.getDateSummary(date);
        setWorkouts(data);
      } catch {
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [date]);

  const formatDate = (d: string) => {
    const [y, m, day] = d.split('-');
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const dateObj = new Date(+y, +m - 1, +day);
    return `${+m}월 ${+day}일 (${weekDays[dateObj.getDay()]})`;
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Mobile: bottom sheet / Desktop: centered popup */}
      <div className="fixed z-50 bg-surface shadow-xl flex flex-col
        bottom-0 left-0 right-0 rounded-t-2xl max-h-[70vh]
        md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:right-auto md:rounded-2xl md:w-[420px] md:max-h-[60vh]"
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-2 pb-1 md:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-light">
          <h3 className="font-bold text-lg">{formatDate(date)}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 active:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {loading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : workouts.length === 0 ? (
            <EmptyState
              icon="📝"
              title="운동 기록이 없습니다"
              description="이 날의 운동을 기록해보세요"
            />
          ) : (
            <div className="space-y-2">
              {workouts.map((w) => (
                <Link
                  key={w.id}
                  href={`/workouts/${w.id}`}
                  className="block bg-surface-secondary rounded-xl p-3.5 active:bg-gray-100 transition border-l-4 border-primary-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold tabular-nums">
                        {w.startTime}{w.endTime ? ` ~ ${w.endTime}` : ''}
                      </span>
                      {w.memo && (
                        <p className="text-sm text-gray-500 mt-0.5">{w.memo}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-400 space-y-0.5">
                      <p className="flex items-center gap-1 justify-end"><span className="text-primary-500 font-semibold">{w.exerciseCount}</span> 종목</p>
                      <p className="flex items-center gap-1 justify-end"><span className="text-primary-500 font-semibold">{w.totalSets}</span> 세트</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-5 py-3 border-t border-border-light env-safe-bottom">
          <Link
            href={`/workouts/new?date=${date}`}
            className="block w-full py-3 bg-primary-600 text-white rounded-xl font-semibold text-center hover:bg-primary-700 active:bg-primary-700 transition min-h-[48px] flex items-center justify-center shadow-sm"
          >
            + 운동 기록 추가
          </Link>
        </div>
      </div>
    </>,
    document.body
  );
}
