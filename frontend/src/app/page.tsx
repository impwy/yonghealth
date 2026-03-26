'use client';

import { useState } from 'react';
import WorkoutCalendar from '@/components/WorkoutCalendar';
import WorkoutDaySheet from '@/components/WorkoutDaySheet';

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date === selectedDate ? null : date);
  };

  return (
    <div className="space-y-4 pb-16 md:pb-0">
      <WorkoutCalendar onDateSelect={handleDateSelect} selectedDate={selectedDate} />

      {selectedDate && (
        <WorkoutDaySheet date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  );
}
