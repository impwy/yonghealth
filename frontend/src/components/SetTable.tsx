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
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="py-2 w-16">세트</th>
            <th className="py-2">중량</th>
            <th className="py-2 w-16">단위</th>
            <th className="py-2 w-16">횟수</th>
            <th className="py-2 w-24 text-right">작업</th>
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
                      className="w-12 border rounded px-1 py-1"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      step="0.5"
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: +e.target.value })}
                      className="w-20 border rounded px-1 py-1"
                    />
                  </td>
                  <td className="py-2">
                    <select
                      value={form.weightUnit}
                      onChange={(e) => setForm({ ...form, weightUnit: e.target.value as WeightUnit })}
                      className="border rounded px-1 py-1"
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
                      className="w-12 border rounded px-1 py-1"
                    />
                  </td>
                  <td className="py-2 text-right space-x-1">
                    <button onClick={() => handleUpdate(set.id)} className="text-blue-600 hover:underline">저장</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-400 hover:underline">취소</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-2 font-medium">{set.setNumber}</td>
                  <td className="py-2">{set.weight}</td>
                  <td className="py-2 text-gray-500">{set.weightUnit}</td>
                  <td className="py-2">{set.reps}회</td>
                  <td className="py-2 text-right space-x-1">
                    <button onClick={() => startEdit(set)} className="text-blue-600 hover:underline">수정</button>
                    <button onClick={() => handleDelete(set.id)} className="text-red-500 hover:underline">삭제</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {adding ? (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            placeholder="세트"
            value={form.setNumber}
            onChange={(e) => setForm({ ...form, setNumber: +e.target.value })}
            className="w-12 border rounded px-2 py-1 text-sm"
          />
          <input
            type="number"
            step="0.5"
            placeholder="중량"
            value={form.weight || ''}
            onChange={(e) => setForm({ ...form, weight: +e.target.value })}
            className="w-20 border rounded px-2 py-1 text-sm"
          />
          <select
            value={form.weightUnit}
            onChange={(e) => setForm({ ...form, weightUnit: e.target.value as WeightUnit })}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="KG">KG</option>
            <option value="LB">LB</option>
          </select>
          <input
            type="number"
            placeholder="횟수"
            value={form.reps || ''}
            onChange={(e) => setForm({ ...form, reps: +e.target.value })}
            className="w-12 border rounded px-2 py-1 text-sm"
          />
          <button onClick={handleAdd} className="text-sm text-blue-600 hover:underline">추가</button>
          <button onClick={() => setAdding(false)} className="text-sm text-gray-400 hover:underline">취소</button>
        </div>
      ) : (
        <button
          onClick={() => {
            setForm({ setNumber: sets.length + 1, weight: 0, weightUnit: 'KG', reps: 0 });
            setAdding(true);
          }}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          + 세트 추가
        </button>
      )}
    </div>
  );
}
