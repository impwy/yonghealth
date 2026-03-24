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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ExerciseSetRequest>({
    setNumber: sets.length + 1,
    weight: 0,
    weightUnit: 'KG',
    reps: 0,
  });

  const handleAdd = async () => {
    await exerciseSetApi.create(exerciseId, form);
    setAdding(false);
    setForm({ setNumber: sets.length + 2, weight: 0, weightUnit: 'KG', reps: 0 });
    onUpdate();
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

  return (
    <div className="mt-2">
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <table className="w-full text-sm min-w-[320px]">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2 w-12">세트</th>
              <th className="py-2">중량</th>
              <th className="py-2 w-14">단위</th>
              <th className="py-2 w-14">횟수</th>
              <th className="py-2 w-20 text-right">작업</th>
            </tr>
          </thead>
          <tbody>
            {sets.map((set) => (
              <tr key={set.id} className="border-b border-gray-100">
                {editingId === set.id ? (
                  <>
                    <td className="py-2">
                      <input
                        type="number"
                        value={form.setNumber}
                        onChange={(e) => setForm({ ...form, setNumber: +e.target.value })}
                        className="w-10 border rounded px-1 py-1.5"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        step="0.5"
                        value={form.weight}
                        onChange={(e) => setForm({ ...form, weight: +e.target.value })}
                        className="w-full max-w-[72px] border rounded px-1 py-1.5"
                      />
                    </td>
                    <td className="py-2">
                      <select
                        value={form.weightUnit}
                        onChange={(e) => setForm({ ...form, weightUnit: e.target.value as WeightUnit })}
                        className="border rounded px-1 py-1.5"
                      >
                        <option value="KG">KG</option>
                        <option value="LB">LB</option>
                      </select>
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        value={form.reps}
                        onChange={(e) => setForm({ ...form, reps: +e.target.value })}
                        className="w-10 border rounded px-1 py-1.5"
                      />
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleUpdate(set.id)} className="text-blue-600 active:text-blue-800 min-h-[44px] px-1">저장</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 active:text-gray-600 min-h-[44px] px-1">취소</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2 font-medium">{set.setNumber}</td>
                    <td className="py-2">{set.weight}</td>
                    <td className="py-2 text-gray-500">{set.weightUnit}</td>
                    <td className="py-2">{set.reps}회</td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(set)} className="text-blue-600 active:text-blue-800 min-h-[44px] px-1">수정</button>
                        <button onClick={() => handleDelete(set.id)} className="text-red-500 active:text-red-700 min-h-[44px] px-1">삭제</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {adding ? (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <input
            type="number"
            placeholder="세트"
            value={form.setNumber}
            onChange={(e) => setForm({ ...form, setNumber: +e.target.value })}
            className="w-12 border rounded px-2 py-2"
          />
          <input
            type="number"
            step="0.5"
            placeholder="중량"
            value={form.weight || ''}
            onChange={(e) => setForm({ ...form, weight: +e.target.value })}
            className="w-20 border rounded px-2 py-2"
          />
          <select
            value={form.weightUnit}
            onChange={(e) => setForm({ ...form, weightUnit: e.target.value as WeightUnit })}
            className="border rounded px-2 py-2"
          >
            <option value="KG">KG</option>
            <option value="LB">LB</option>
          </select>
          <input
            type="number"
            placeholder="횟수"
            value={form.reps || ''}
            onChange={(e) => setForm({ ...form, reps: +e.target.value })}
            className="w-14 border rounded px-2 py-2"
          />
          <button onClick={handleAdd} className="text-sm text-blue-600 active:text-blue-800 min-h-[44px] px-2">추가</button>
          <button onClick={() => setAdding(false)} className="text-sm text-gray-400 active:text-gray-600 min-h-[44px] px-2">취소</button>
        </div>
      ) : (
        <button
          onClick={() => {
            setForm({ setNumber: sets.length + 1, weight: 0, weightUnit: 'KG', reps: 0 });
            setAdding(true);
          }}
          className="mt-3 text-sm text-blue-600 active:text-blue-800 min-h-[44px]"
        >
          + 세트 추가
        </button>
      )}
    </div>
  );
}
