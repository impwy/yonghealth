'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { WorkoutDetail } from '@/types';
import { workoutApi, exerciseApi } from '@/lib/api';
import ExerciseAccordion from '@/components/ExerciseAccordion';
import Toast from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [newExerciseName, setNewExerciseName] = useState('');

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

  const handleDelete = async () => {
    try {
      await workoutApi.delete(id);
      router.push('/');
    } catch {
      setToast({ message: '삭제에 실패했습니다', type: 'error' });
    }
  };

  const handleAddExercise = async () => {
    if (!newExerciseName.trim()) return;
    try {
      await exerciseApi.create(id, {
        name: newExerciseName,
        sortOrder: (workout?.exercises.length || 0) + 1,
      });
      setNewExerciseName('');
      fetchWorkout();
    } catch {
      setToast({ message: '종목 추가에 실패했습니다', type: 'error' });
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;
  if (!workout) return <div className="text-center py-20 text-gray-400">운동 기록을 찾을 수 없습니다</div>;

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showDelete && (
        <ConfirmDialog
          message="이 운동 세션을 삭제하시겠습니까? 모든 종목과 세트가 함께 삭제됩니다."
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}

      {/* 뒤로가기 */}
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 min-h-[44px]">
        &larr; 목록으로
      </Link>

      {/* 세션 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-bold">운동 상세</h1>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={handleUpdate} className="px-3 py-2 md:px-4 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 active:bg-blue-800 min-h-[44px]">저장</button>
                <button onClick={() => setEditing(false)} className="px-3 py-2 md:px-4 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 active:bg-gray-100 min-h-[44px]">취소</button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="px-3 py-2 md:px-4 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 active:bg-gray-100 min-h-[44px]">수정</button>
                <button onClick={() => setShowDelete(true)} className="px-3 py-2 md:px-4 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 active:bg-red-700 min-h-[44px]">삭제</button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">날짜</label>
              <input type="date" value={form.workoutDate} onChange={(e) => setForm({ ...form, workoutDate: e.target.value })} className="w-full border rounded-lg px-3 py-2.5" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">시작 시간</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full border rounded-lg px-3 py-2.5" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">종료 시간</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full border rounded-lg px-3 py-2.5" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">메모</label>
              <input type="text" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} className="w-full border rounded-lg px-3 py-2.5" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">날짜:</span> <span className="font-medium">{workout.workoutDate}</span></div>
            <div><span className="text-gray-500">시작:</span> <span className="font-medium">{workout.startTime}</span></div>
            <div><span className="text-gray-500">종료:</span> <span className="font-medium">{workout.endTime || '-'}</span></div>
            <div><span className="text-gray-500">메모:</span> <span className="font-medium">{workout.memo || '-'}</span></div>
          </div>
        )}
      </div>

      {/* 종목 리스트 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">운동 종목 ({workout.exercises.length})</h2>
      </div>

      {workout.exercises
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((exercise) => (
          <ExerciseAccordion key={exercise.id} exercise={exercise} onUpdate={fetchWorkout} />
        ))}

      {/* 종목 추가 */}
      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={newExerciseName}
          onChange={(e) => setNewExerciseName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddExercise()}
          placeholder="새 운동 종목명 입력..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5"
        />
        <button
          onClick={handleAddExercise}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 min-h-[44px] whitespace-nowrap"
        >
          종목 추가
        </button>
      </div>
    </div>
  );
}
