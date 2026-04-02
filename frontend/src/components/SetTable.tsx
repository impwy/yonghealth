'use client';

import { useState } from 'react';
import type { ExerciseSet, ExerciseSetRequest, WeightUnit } from '@/types';
import { exerciseSetApi } from '@/lib/api';

interface SetTableProps {
  exerciseId: number;
  sets: ExerciseSet[];
  onUpdate: () => void;
}

export default function SetTable({ exerciseId, sets, onUpdate }: SetTableProps) {
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ExerciseSetRequest>({
    setNumber: sets.length + 1,
    weight: 0,
    weightUnit: 'KG',
    reps: 0,
  });

  const handleAdd = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await exerciseSetApi.create(exerciseId, form);
      setAdding(false);
      setForm({ setNumber: sets.length + 2, weight: 0, weightUnit: 'KG', reps: 0 });
      onUpdate();
    } catch {
      // 409 Conflict 등 — 무시 (이미 추가됨)
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id: number) => {
    await exerciseSetApi.update(id, form);
    setEditingId(null);
    onUpdate();
  };

  const handleDelete = async (id: number) => {
    await exerciseSetApi.delete(id);
    onUpdate();
  };

  const startEdit = (set: ExerciseSet) => {
    setEditingId(set.id);
    setForm({
      setNumber: set.setNumber,
      weight: set.weight,
      weightUnit: set.weightUnit,
      reps: set.reps,
    });
  };

  const inputClass = "border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition";

  return (
    <div className="mt-3">
      {/* Set cards */}
      <div className="space-y-2">
        {sets.map((set, idx) => (
          <div key={set.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl ${idx % 2 === 0 ? 'bg-surface-secondary' : 'bg-white'}`}>
            {editingId === set.id ? (
              <>
                <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  <input type="number" value={form.setNumber} onChange={(e) => setForm({ ...form, setNumber: +e.target.value })} className="w-7 text-center bg-transparent text-xs" />
                </span>
                <input type="number" step="0.5" value={form.weight} onChange={(e) => setForm({ ...form, weight: +e.target.value })} className={`${inputClass} w-16`} />
                <select value={form.weightUnit} onChange={(e) => setForm({ ...form, weightUnit: e.target.value as WeightUnit })} className={`${inputClass} w-14`}>
                  <option value="KG">KG</option>
                  <option value="LB">LB</option>
                </select>
                <input type="number" value={form.reps} onChange={(e) => setForm({ ...form, reps: +e.target.value })} className={`${inputClass} w-14`} />
                <span className="text-xs text-gray-400">회</span>
                <div className="flex gap-1 ml-auto flex-shrink-0">
                  <button onClick={() => handleUpdate(set.id)} className="text-xs text-primary-600 font-semibold min-h-[36px] px-1.5">저장</button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 min-h-[36px] px-1.5">취소</button>
                </div>
              </>
            ) : (
              <>
                <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{set.setNumber}</span>
                <span className="text-sm font-semibold tabular-nums">{set.weight}<span className="text-xs text-gray-400 ml-0.5">{set.weightUnit}</span></span>
                <span className="text-xs text-gray-300">|</span>
                <span className="text-sm font-semibold tabular-nums">{set.reps}<span className="text-xs text-gray-400 ml-0.5">회</span></span>
                <div className="flex gap-1 ml-auto flex-shrink-0">
                  <button onClick={() => startEdit(set)} className="text-xs text-primary-600 font-medium min-h-[36px] px-1.5">수정</button>
                  <button onClick={() => handleDelete(set.id)} className="text-xs text-danger font-medium min-h-[36px] px-1.5">삭제</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="flex items-center gap-2 mt-3 p-2.5 bg-primary-50 rounded-xl">
          <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{form.setNumber}</span>
          <input type="number" step="0.5" placeholder="중량" value={form.weight || ''} onChange={(e) => setForm({ ...form, weight: +e.target.value })} className={`${inputClass} w-16`} />
          <select value={form.weightUnit} onChange={(e) => setForm({ ...form, weightUnit: e.target.value as WeightUnit })} className={`${inputClass} w-14`}>
            <option value="KG">KG</option>
            <option value="LB">LB</option>
          </select>
          <input type="number" placeholder="횟수" value={form.reps || ''} onChange={(e) => setForm({ ...form, reps: +e.target.value })} className={`${inputClass} w-14`} />
          <span className="text-xs text-gray-400">회</span>
          <div className="flex gap-1 ml-auto flex-shrink-0">
            <button onClick={handleAdd} disabled={submitting} className="text-xs text-primary-600 font-semibold min-h-[36px] px-1.5 disabled:text-gray-400">{submitting ? '...' : '추가'}</button>
            <button onClick={() => setAdding(false)} className="text-xs text-gray-400 min-h-[36px] px-1.5">취소</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setForm({ setNumber: sets.length + 1, weight: 0, weightUnit: 'KG', reps: 0 });
            setAdding(true);
          }}
          className="mt-3 text-sm text-primary-600 font-medium active:text-primary-800 min-h-[44px]"
        >
          + 세트 추가
        </button>
      )}
    </div>
  );
}
