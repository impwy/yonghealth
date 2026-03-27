'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ExerciseCatalog, BodyPart } from '@/types';
import { exerciseCatalogApi } from '@/lib/api';

interface ExercisePickerProps {
  onSelect: (catalog: ExerciseCatalog | null, customName?: string) => void;
  onClose: () => void;
}

const CATEGORIES: { value: BodyPart | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'CHEST', label: '가슴' },
  { value: 'BACK', label: '등' },
  { value: 'LEGS', label: '하체' },
  { value: 'SHOULDERS', label: '어깨' },
  { value: 'ARMS', label: '팔' },
  { value: 'CORE', label: '코어' },
  { value: 'CARDIO', label: '유산소' },
];

export default function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<BodyPart | 'ALL'>('ALL');
  const [results, setResults] = useState<ExerciseCatalog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        if (query.trim()) {
          const data = await exerciseCatalogApi.search(query);
          setResults(data.results);
        } else if (category !== 'ALL') {
          const data = await exerciseCatalogApi.getByCategory(category);
          setResults(data);
        } else {
          const data = await exerciseCatalogApi.getAll();
          setResults(data);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, query.trim() ? 300 : 0);
    return () => clearTimeout(timer);
  }, [query, category]);

  const handleCustomSubmit = () => {
    if (customName.trim()) {
      onSelect(null, customName.trim());
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Modal — mobile: fullscreen / desktop: centered */}
      <div className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-white flex flex-col md:top-1/2 md:left-1/2 md:right-auto md:bottom-auto md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:max-h-[80vh] md:rounded-2xl md:shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 env-safe">
          <h3 className="font-bold text-lg">운동 선택</h3>
          <button onClick={onClose} className="text-gray-400 active:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center">
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCategory('ALL'); }}
            placeholder="운동명 검색 (예: 벤치, bench press)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
          />
        </div>

        {/* Category filter */}
        <div className="px-4 py-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => { setCategory(cat.value); setQuery(''); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition
                ${category === cat.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 pb-2">
          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm">검색 중...</div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              {query ? '검색 결과가 없습니다' : '운동 목록이 없습니다'}
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((catalog) => (
                <button
                  key={catalog.id}
                  onClick={() => onSelect(catalog)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{catalog.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {getCategoryLabel(catalog.category)} · {getEquipmentLabel(catalog.equipment)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom input toggle */}
        <div className="px-4 py-3 border-t border-gray-100 env-safe-bottom">
          {showCustomInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="직접 입력"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
              />
              <button
                onClick={handleCustomSubmit}
                disabled={!customName.trim()}
                className="px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium active:bg-primary-700 disabled:bg-gray-300 min-h-[44px]"
              >
                추가
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full py-2.5 text-sm text-primary-600 font-medium active:text-blue-800"
            >
              직접 입력하기
            </button>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

function getCategoryLabel(category: BodyPart): string {
  const map: Record<BodyPart, string> = {
    CHEST: '가슴', BACK: '등', LEGS: '하체', SHOULDERS: '어깨',
    ARMS: '팔', CORE: '코어', CARDIO: '유산소',
  };
  return map[category];
}

function getEquipmentLabel(equipment: string): string {
  const map: Record<string, string> = {
    BARBELL: '바벨', DUMBBELL: '덤벨', MACHINE: '머신',
    BODYWEIGHT: '맨몸', CABLE: '케이블', BAND: '밴드',
  };
  return map[equipment] || equipment;
}
