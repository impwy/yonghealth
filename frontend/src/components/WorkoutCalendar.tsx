'use client';

import { useState, useEffect } from 'react';
import type { CalendarSummaryResponse, CalendarDaySummary } from '@/types';
import { workoutApi } from '@/lib/api';

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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={goToPrevMonth} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 active:bg-gray-100 rounded-lg">
          ◀
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">{year}년 {month}월</h2>
          <button onClick={goToToday} className="text-xs text-blue-600 border border-blue-200 rounded px-2 py-1 active:bg-blue-50">
            오늘
          </button>
        </div>
        <button onClick={goToNextMonth} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 active:bg-gray-100 rounded-lg">
          ▶
        </button>
      </div>

      {/* Week header */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map((day, i) => (
          <div key={day} className={`text-center text-xs font-medium py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">불러오는 중...</div>
      ) : (
        <div className="grid grid-cols-7">
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
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative transition-colors
                  ${isSelected ? 'bg-blue-600 text-white' : isToday ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-50 active:bg-gray-100'}
                  ${dayOfWeek === 0 && !isSelected ? 'text-red-500' : ''}
                  ${dayOfWeek === 6 && !isSelected ? 'text-blue-500' : ''}
                `}
              >
                <span>{day}</span>
                {daySummary && (
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: Math.min(daySummary.workoutCount, 3) }).map((_, j) => (
                      <span key={j} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
