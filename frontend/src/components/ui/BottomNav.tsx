'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTimer } from '@/contexts/TimerContext';
import TimerSheet from './TimerSheet';

export default function BottomNav() {
  const pathname = usePathname();
  const { remainingSeconds, isRunning, isComplete } = useTimer();
  const [showTimer, setShowTimer] = useState(false);

  const timerActive = isRunning || remainingSeconds > 0;
  const timerMin = Math.floor(remainingSeconds / 60);
  const timerSec = remainingSeconds % 60;

  const items = [
    { href: '/', label: '홈', icon: '📅' },
    { href: '/workouts/new', label: '기록하기', icon: '➕' },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 md:hidden env-safe-bottom">
        <div className="flex items-center justify-around h-14">
          {/* 홈 */}
          <Link
            href={items[0].href}
            className={`flex flex-col items-center justify-center flex-1 h-full min-w-[44px] transition-colors ${
              pathname === items[0].href ? 'text-blue-600' : 'text-gray-400 active:text-gray-600'
            }`}
          >
            <span className="text-lg">{items[0].icon}</span>
            <span className="text-[10px] mt-0.5">{items[0].label}</span>
          </Link>

          {/* 타이머 */}
          <button
            onClick={() => setShowTimer(true)}
            className={`flex flex-col items-center justify-center flex-1 h-full min-w-[44px] transition-colors ${
              timerActive ? 'text-blue-600' : 'text-gray-400 active:text-gray-600'
            } ${isComplete ? 'animate-pulse' : ''}`}
          >
            {timerActive ? (
              <>
                <span className="text-sm font-bold tabular-nums">{timerMin}:{String(timerSec).padStart(2, '0')}</span>
                <span className="text-[10px] mt-0.5">{isRunning ? '진행중' : '일시정지'}</span>
              </>
            ) : (
              <>
                <span className="text-lg">⏱️</span>
                <span className="text-[10px] mt-0.5">타이머</span>
              </>
            )}
          </button>

          {/* 기록하기 */}
          <Link
            href={items[1].href}
            className={`flex flex-col items-center justify-center flex-1 h-full min-w-[44px] transition-colors ${
              pathname === items[1].href ? 'text-blue-600' : 'text-gray-400 active:text-gray-600'
            }`}
          >
            <span className="text-lg">{items[1].icon}</span>
            <span className="text-[10px] mt-0.5">{items[1].label}</span>
          </Link>
        </div>
      </nav>

      {showTimer && <TimerSheet onClose={() => setShowTimer(false)} />}
    </>
  );
}
