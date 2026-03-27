'use client';

import { useState } from 'react';
import type { WorkoutRequest, ExerciseRequest, ExerciseSetRequest, WeightUnit, ExerciseCatalog } from '@/types';
import ExercisePicker from './ExercisePicker';

interface ExerciseFormData extends ExerciseRequest {
  sets: ExerciseSetRequest[];
}

interface WorkoutFormProps {
  onSubmit: (workout: WorkoutRequest, exercises: ExerciseFormData[]) => Promise<void>;
  loading: boolean;
  initialDate?: string;
}

export default function WorkoutForm({ onSubmit, loading, initialDate }: WorkoutFormProps) {
  const today = initialDate || new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().slice(0, 5);

  const [workout, setWorkout] = useState<WorkoutRequest>({
    workoutDate: today,
    startTime: now,
    endTime: '',
    memo: '',
  });

  const [exercises, setExercises] = useState<ExerciseFormData[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const handlePickerSelect = (catalog: ExerciseCatalog | null, customName?: string) => {
    const displayName = catalog ? catalog.name : (customName || '');
    setExercises([
      ...exercises,
      {
        exerciseCatalogId: catalog?.id || null,
        displayName,
        customName: catalog ? null : customName || null,
        sortOrder: exercises.length + 1,
        sets: [],
      },
    ]);
    setShowPicker(false);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: string, value: string | number) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const addSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    const sets = updated[exerciseIndex].sets;
    sets.push({
      setNumber: sets.length + 1,
      weight: 0,
      weightUnit: 'KG' as WeightUnit,
      reps: 0,
    });
    setExercises(updated);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    setExercises(updated);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: string, value: string | number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      [field]: field === 'weightUnit' ? value : +value,
    };
    setExercises(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(workout, exercises);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 세션 기본 정보 */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 md:p-5">
          <h2 className="font-semibold mb-4">운동 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">날짜</label>
              <input
                type="date"
                value={workout.workoutDate}
                onChange={(e) => setWorkout({ ...workout, workoutDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">시작 시간</label>
              <input
                type="time"
                value={workout.startTime}
                onChange={(e) => setWorkout({ ...workout, startTime: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">종료 시간 (선택)</label>
              <input
                type="time"
                value={workout.endTime}
                onChange={(e) => setWorkout({ ...workout, endTime: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">메모 (선택)</label>
              <input
                type="text"
                value={workout.memo}
                onChange={(e) => setWorkout({ ...workout, memo: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5"
                placeholder="오늘의 컨디션..."
              />
            </div>
          </div>
        </div>

        {/* 종목 리스트 */}
        {exercises.map((exercise, ei) => (
          <div key={ei} className="bg-surface rounded-2xl border border-border shadow-sm p-4 md:p-5">
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-base md:text-lg font-semibold truncate">{exercise.displayName}</p>
                {exercise.customName && (
                  <p className="text-xs text-gray-400">직접 입력</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeExercise(ei)}
                className="text-sm text-red-500 active:text-red-700 min-h-[44px] px-2 whitespace-nowrap"
              >
                종목 삭제
              </button>
            </div>

            {/* 세트 테이블 */}
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <table className="w-full text-sm mb-3 min-w-[320px]">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 w-12">세트</th>
                    <th className="py-2">중량</th>
                    <th className="py-2 w-16">단위</th>
                    <th className="py-2 w-14">횟수</th>
                    <th className="py-2 w-11"></th>
                  </tr>
                </thead>
                <tbody>
                  {exercise.sets.map((set, si) => (
                    <tr key={si} className="border-b border-gray-100">
                      <td className="py-2">{set.setNumber}</td>
                      <td className="py-2">
                        <input
                          type="number"
                          step="0.5"
                          value={set.weight || ''}
                          onChange={(e) => updateSet(ei, si, 'weight', e.target.value)}
                          className="w-full max-w-[80px] border rounded px-2 py-1.5"
                          required
                        />
                      </td>
                      <td className="py-2">
                        <select
                          value={set.weightUnit}
                          onChange={(e) => updateSet(ei, si, 'weightUnit', e.target.value)}
                          className="border rounded px-1 py-1.5"
                        >
                          <option value="KG">KG</option>
                          <option value="LB">LB</option>
                        </select>
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          value={set.reps || ''}
                          onChange={(e) => updateSet(ei, si, 'reps', e.target.value)}
                          className="w-full max-w-[56px] border rounded px-2 py-1.5"
                          required
                        />
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeSet(ei, si)}
                          className="text-red-400 active:text-red-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => addSet(ei)}
              className="text-sm text-primary-600 active:text-primary-800 min-h-[44px]"
            >
              + 세트 추가
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-400 hover:text-primary-600 active:bg-primary-50 transition min-h-[52px]"
        >
          + 운동 종목 추가
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 active:bg-primary-700 disabled:bg-gray-400 transition min-h-[52px]"
        >
          {loading ? '저장 중...' : '운동 기록 저장'}
        </button>
      </form>

      {showPicker && (
        <ExercisePicker
          onSelect={handlePickerSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
