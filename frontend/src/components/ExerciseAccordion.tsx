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
  const [displayName, setDisplayName] = useState(exercise.displayName);

  const handleUpdate = async () => {
    await exerciseApi.update(exercise.id, { displayName, sortOrder: exercise.sortOrder });
    setEditing(false);
    onUpdate();
  };

  const handleDelete = async () => {
    await exerciseApi.delete(exercise.id);
    onUpdate();
  };

  return (
    <div className={`border rounded-2xl bg-surface mb-3 shadow-sm overflow-hidden transition-colors ${open ? 'border-primary-200' : 'border-border'}`}>
      <div
        className="flex items-center justify-between px-4 py-3.5 cursor-pointer min-h-[52px]"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`text-gray-400 text-xs transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-0' : '-rotate-90'}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          {editing ? (
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="border border-primary-300 rounded-lg px-2.5 py-1.5 text-sm min-w-0 flex-1 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          ) : (
            <span className="font-semibold truncate">{exercise.displayName}</span>
          )}
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 flex-shrink-0 font-medium">{exercise.sets.length}세트</span>
        </div>
        <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {editing ? (
            <>
              <button onClick={handleUpdate} className="text-sm text-primary-600 font-medium active:text-primary-800 min-h-[44px] px-2">저장</button>
              <button onClick={() => { setEditing(false); setDisplayName(exercise.displayName); }} className="text-sm text-gray-400 active:text-gray-600 min-h-[44px] px-2">취소</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="text-sm text-primary-600 font-medium active:text-primary-800 min-h-[44px] px-2">수정</button>
              <button onClick={handleDelete} className="text-sm text-danger font-medium active:text-red-700 min-h-[44px] px-2">삭제</button>
            </>
          )}
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4 border-t border-border-light">
          <SetTable exerciseId={exercise.id} sets={exercise.sets} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
}
