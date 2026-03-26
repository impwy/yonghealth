'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { workoutApi, exerciseApi, exerciseSetApi } from '@/lib/api';
import WorkoutForm from '@/components/WorkoutForm';
import Toast from '@/components/ui/Toast';
import type { WorkoutRequest, ExerciseRequest, ExerciseSetRequest } from '@/types';

interface ExerciseFormData extends ExerciseRequest {
  sets: ExerciseSetRequest[];
}

function NewWorkoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDate = searchParams.get('date') || undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (workout: WorkoutRequest, exercises: ExerciseFormData[]) => {
    setLoading(true);
    try {
      const created = await workoutApi.create(workout);

      for (const exercise of exercises) {
        const createdExercise = await exerciseApi.create(created.id, {
          displayName: exercise.displayName,
          sortOrder: exercise.sortOrder,
        });

        for (const set of exercise.sets) {
          await exerciseSetApi.create(createdExercise.id, set);
        }
      }

      router.push(`/workouts/${created.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-16 md:pb-0">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4">
        &larr; 달력으로
      </Link>
      <h1 className="text-2xl font-bold mb-6">새 운동 기록</h1>
      <WorkoutForm onSubmit={handleSubmit} loading={loading} initialDate={initialDate} />
    </div>
  );
}

export default function NewWorkoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">불러오는 중...</div>}>
      <NewWorkoutContent />
    </Suspense>
  );
}
