'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { WorkoutDetail, ExerciseCatalog } from '@/types';
import { workoutApi, exerciseApi } from '@/lib/api';
import ExerciseAccordion from '@/components/ExerciseAccordion';
import ExercisePicker from '@/components/ExercisePicker';
import Toast from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { SkeletonDetail } from '@/components/ui/Skeleton';

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    workoutDate: '',
    startTime: '',
    endTime: '',
    memo: '',
  });

  const fetchWorkout = useCallback(async () => {
    try {
      const data = await workoutApi.getById(id);
      setWorkout(data);
      setForm({
        workoutDate: data.workoutDate,
        startTime: data.startTime,
        endTime: data.endTime || '',
        memo: data.memo || '',
      });
    } catch {
      setToast({ message: '데이터를 불러올 수 없습니다', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWorkout();
  }, [fetchWorkout]);

  const handleUpdate = async () => {
    try {
      await workoutApi.update(id, {
        workoutDate: form.workoutDate,
        startTime: form.startTime,
        endTime: form.endTime || undefined,
        memo: form.memo || undefined,
      });
      setEditing(false);
      setToast({ message: '수정되었습니다', type: 'success' });
      fetchWorkout();
    } catch {
      setToast({ message: '수정에 실패했습니다', type: 'error' });
    }
  };

  const handleFinishWorkout = async () => {
    const now = new Date().toTimeString().slice(0, 5);
    try {
      await workoutApi.update(id, {
        workoutDate: form.workoutDate,
        startTime: form.startTime,
        endTime: now,
        memo: form.memo || undefined,
      });
      setToast({ message: '운동 완료!', type: 'success' });
      fetchWorkout();
    } catch {
      setToast({ message: '저장에 실패했습니다', type: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await workoutApi.delete(id);
      router.push('/');
    } catch {
      setToast({ message: '삭제에 실패했습니다', type: 'error' });
    }
  };

  const handleAddExercise = async (catalog: ExerciseCatalog | null, customName?: string) => {
    const displayName = catalog ? catalog.name : (customName || '');
    if (!displayName) return;
    try {
      await exerciseApi.create(id, {
        exerciseCatalogId: catalog?.id || null,
        displayName,
        customName: catalog ? null : customName || null,
        sortOrder: (workout?.exercises.length || 0) + 1,
      });
      setShowPicker(false);
      fetchWorkout();
    } catch {
      setToast({ message: '종목 추가에 실패했습니다', type: 'error' });
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition";

  if (loading) return <SkeletonDetail />;
  if (!workout) return <div className="text-center py-20 text-gray-400">운동 기록을 찾을 수 없습니다</div>;

  return (
    <div className="pb-16 md:pb-0">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showDelete && (
        <ConfirmDialog
          message="이 운동 세션을 삭제하시겠습니까? 모든 종목과 세트가 함께 삭제됩니다."
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}

      {/* 뒤로가기 */}
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4 min-h-[44px] transition">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        달력으로
      </Link>

      {/* 세션 정보 */}
      <div className="bg-surface rounded-2xl border border-border p-4 md:p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-bold">운동 상세</h1>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={handleUpdate} className="px-3 py-2 md:px-4 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 active:bg-primary-700 min-h-[44px] transition">저장</button>
                <button onClick={() => setEditing(false)} className="px-3 py-2 md:px-4 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 active:bg-gray-100 min-h-[44px] transition">취소</button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="px-3 py-2 md:px-4 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 active:bg-gray-100 min-h-[44px] transition">수정</button>
                <button onClick={() => setShowDelete(true)} className="px-3 py-2 md:px-4 bg-danger text-white rounded-xl text-sm font-semibold hover:bg-red-600 active:bg-red-700 min-h-[44px] transition">삭제</button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1.5 font-medium">날짜</label>
              <input type="date" value={form.workoutDate} onChange={(e) => setForm({ ...form, workoutDate: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1.5 font-medium">시작 시간</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1.5 font-medium">종료 시간</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1.5 font-medium">메모</label>
              <input type="text" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} className={inputClass} />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-400">날짜</span> <span className="font-semibold ml-2">{workout.workoutDate}</span></div>
              <div><span className="text-gray-400">시작</span> <span className="font-semibold ml-2 tabular-nums">{workout.startTime}</span></div>
              <div><span className="text-gray-400">종료</span> <span className="font-semibold ml-2 tabular-nums">{workout.endTime || '-'}</span></div>
              <div><span className="text-gray-400">메모</span> <span className="font-semibold ml-2">{workout.memo || '-'}</span></div>
            </div>
            {!workout.endTime && (
              <button
                onClick={handleFinishWorkout}
                className="mt-4 w-full py-3 bg-success text-white rounded-xl font-semibold hover:bg-green-700 active:bg-green-800 transition min-h-[48px]"
              >
                운동 완료 (현재 시간으로 종료)
              </button>
            )}
          </>
        )}
      </div>

      {/* 종목 리스트 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">운동 종목 <span className="text-primary-500">({workout.exercises.length})</span></h2>
      </div>

      {workout.exercises
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((exercise) => (
          <ExerciseAccordion key={exercise.id} exercise={exercise} onUpdate={fetchWorkout} />
        ))}

      {/* 종목 추가 */}
      <button
        onClick={() => setShowPicker(true)}
        className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 hover:border-primary-400 hover:text-primary-600 active:bg-primary-50 transition min-h-[48px] font-medium"
      >
        + 운동 종목 추가
      </button>

      {showPicker && (
        <ExercisePicker
          onSelect={handleAddExercise}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
