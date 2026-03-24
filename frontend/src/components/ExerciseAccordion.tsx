'use client';

import { useState } from 'react';
import type { Exercise } from '@/types';
import { exerciseApi } from '@/lib/api';
import SetTable from './SetTable';

interface ExerciseAccordionProps {
  exercise: Exercise;
  onUpdate: () => void;
}

export default function ExerciseAccordion({ exercise, onUpdate }: ExerciseAccordionProps) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(exercise.name);

  const handleUpdate = async () => {
    await exerciseApi.update(exercise.id, { name, sortOrder: exercise.sortOrder });
    setEditing(false);
    onUpdate();
  };

  const handleDelete = async () => {
    await exerciseApi.delete(exercise.id);
    onUpdate();
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white mb-3">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer min-h-[48px]"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-gray-400 text-sm flex-shrink-0">{open ? '▼' : '▶'}</span>
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="border rounded px-2 py-1.5 text-sm min-w-0 flex-1"
            />
          ) : (
            <span className="font-semibold truncate">{exercise.name}</span>
          )}
          <span className="text-sm text-gray-400 flex-shrink-0">{exercise.sets.length}세트</span>
        </div>
        <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {editing ? (
            <>
              <button onClick={handleUpdate} className="text-sm text-blue-600 active:text-blue-800 min-h-[44px] px-2">저장</button>
              <button onClick={() => { setEditing(false); setName(exercise.name); }} className="text-sm text-gray-400 active:text-gray-600 min-h-[44px] px-2">취소</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="text-sm text-blue-600 active:text-blue-800 min-h-[44px] px-2">수정</button>
              <button onClick={handleDelete} className="text-sm text-red-500 active:text-red-700 min-h-[44px] px-2">삭제</button>
            </>
          )}
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4">
          <SetTable exerciseId={exercise.id} sets={exercise.sets} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
}
