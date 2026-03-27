'use client';

import { useState, useEffect } from 'react';
import type { CalendarSummaryResponse, CalendarDaySummary } from '@/types';
import { workoutApi } from '@/lib/api';
import { SkeletonCalendar } from '@/components/ui/Skeleton';

interface WorkoutCalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
}

export default function WorkoutCalendar({ onDateSelect, selectedDate }: WorkoutCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [summary, setSummary] = useState<CalendarSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const data = await workoutApi.getCalendarSummary(year, month);
        setSummary(data);
      } catch {
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [year, month]);

  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
  const getFirstDayOfWeek = (y: number, m: number) => new Date(y, m - 1, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const dayMap = new Map<string, CalendarDaySummary>();
  summary?.days.forEach(d => dayMap.set(d.date, d));

  const goToPrevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
  };

  const goToNextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
  };

  const goToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
    onDateSelect(todayStr);
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  if (loading) return <SkeletonCalendar />;

  return (
    <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={goToPrevMonth} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700 active:bg-gray-100 rounded-xl transition">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold tracking-tight">{year}년 {month}월</h2>
          <button onClick={goToToday} className="text-xs text-primary-600 bg-primary-50 border border-primary-200 rounded-full px-2.5 py-1 font-semibold hover:bg-primary-100 active:bg-primary-100 transition">
            오늘
          </button>
        </div>
        <button onClick={goToNextMonth} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700 active:bg-gray-100 rounded-xl transition">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Week header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, i) => (
          <div key={day} className={`text-center text-[11px] font-semibold uppercase tracking-wider py-1.5 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="aspect-square" />;

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const daySummary = dayMap.get(dateStr);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const dayOfWeek = (firstDay + day - 1) % 7;

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(dateStr)}
              className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm relative transition-all
                ${isSelected
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30 scale-105'
                  : isToday
                    ? 'ring-2 ring-primary-500 text-primary-600 font-bold'
                    : 'hover:bg-gray-100 active:bg-gray-100'
                }
                ${dayOfWeek === 0 && !isSelected ? 'text-red-500' : ''}
                ${dayOfWeek === 6 && !isSelected ? 'text-blue-500' : ''}
              `}
            >
              <span className="leading-none">{day}</span>
              {daySummary && (
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: Math.min(daySummary.workoutCount, 3) }).map((_, j) => (
                    <span key={j} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/80' : 'bg-primary-500'}`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
