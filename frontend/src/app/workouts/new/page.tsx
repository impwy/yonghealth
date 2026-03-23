'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { workoutApi, exerciseApi, exerciseSetApi } from '@/lib/api';
import WorkoutForm from '@/components/WorkoutForm';
import Toast from '@/components/ui/Toast';
import type { WorkoutRequest, ExerciseRequest, ExerciseSetRequest } from '@/types';

interface ExerciseFormData extends ExerciseRequest {
  sets: ExerciseSetRequest[];
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (workout: WorkoutRequest, exercises: ExerciseFormData[]) => {
    setLoading(true);
    try {
      const created = await workoutApi.create(workout);

      for (const exercise of exercises) {
        const createdExercise = await exerciseApi.create(created.id, {
          name: exercise.name,
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
    <div>
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      <h1 className="text-2xl font-bold mb-6">새 운동 기록</h1>
      <WorkoutForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
