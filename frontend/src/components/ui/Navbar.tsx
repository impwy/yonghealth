'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTimer } from '@/contexts/TimerContext';
import TimerSheet from './TimerSheet';

export default function Navbar() {
  const pathname = usePathname();
  const { remainingSeconds, isRunning, isComplete } = useTimer();
  const [showTimer, setShowTimer] = useState(false);
  const footballMode = pathname.startsWith('/football');
  const brandHref = footballMode ? '/football' : '/';
  const brandIcon = footballMode ? '⚽' : '🏋️';
  const brandLabel = footballMode ? 'SundayFC' : 'YongHealth';

  const timerActive = isRunning || remainingSeconds > 0;
  const timerMin = Math.floor(remainingSeconds / 60);
  const timerSec = remainingSeconds % 60;

  return (
    <>
      <nav className={`text-white shadow-md ${
        footballMode
          ? 'bg-gradient-to-r from-football-800 to-football-700'
          : 'bg-gradient-to-r from-primary-600 to-primary-700'
      }`}>
        <div className="max-w-4xl mx-auto px-3 py-3 md:px-4 flex items-center justify-between">
          <Link href={brandHref} className="text-lg md:text-xl font-bold tracking-tight flex items-center gap-1.5">
            <span>{brandIcon}</span> {brandLabel}
          </Link>
          {!footballMode && (
            <div className="flex items-center gap-2">
              {/* Timer - desktop only (mobile uses BottomNav) */}
              <button
                onClick={() => setShowTimer(true)}
                className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition min-h-[44px] ${
                  timerActive
                    ? 'bg-white/20 hover:bg-white/30'
                    : 'hover:bg-white/10'
                } ${isComplete ? 'animate-pulse bg-white/30' : ''}`}
              >
                <span>⏱️</span>
                {timerActive && (
                  <span className="tabular-nums font-bold">
                    {timerMin}:{String(timerSec).padStart(2, '0')}
                  </span>
                )}
              </button>
              <Link
                href="/workouts/new"
                className="hidden md:flex bg-white text-primary-600 px-3 py-2 md:px-4 rounded-lg text-sm font-semibold hover:bg-primary-50 active:bg-primary-100 transition min-h-[44px] items-center"
              >
                + 새 운동 기록
              </Link>
            </div>
          )}
        </div>
      </nav>

      {showTimer && <TimerSheet onClose={() => setShowTimer(false)} />}
    </>
  );
}
