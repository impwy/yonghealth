'use client';

import Link from 'next/link';
import type { Workout } from '@/types';

interface WorkoutCardProps {
  workout: Workout;
}

export default function WorkoutCard({ workout }: WorkoutCardProps) {
  return (
    <Link href={`/workouts/${workout.id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{workout.workoutDate}</h3>
          <span className="text-sm text-gray-500">
            {workout.startTime}
            {workout.endTime && ` ~ ${workout.endTime}`}
          </span>
        </div>
        <div className="flex gap-4 text-sm text-gray-600">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
            종목 {workout.exerciseCount}개
          </span>
          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">
            세트 {workout.totalSetCount}개
          </span>
        </div>
        {workout.memo && (
          <p className="mt-3 text-sm text-gray-500 truncate">{workout.memo}</p>
        )}
      </div>
    </Link>
  );
}
