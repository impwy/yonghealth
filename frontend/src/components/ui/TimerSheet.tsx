'use client';

import { createPortal } from 'react-dom';
import { useTimer } from '@/contexts/TimerContext';

const PRESETS = [
  { label: '60초', seconds: 60 },
  { label: '90초', seconds: 90 },
  { label: '120초', seconds: 120 },
  { label: '180초', seconds: 180 },
];

interface TimerSheetProps {
  onClose: () => void;
}

export default function TimerSheet({ onClose }: TimerSheetProps) {
  const { remainingSeconds, totalSeconds, isRunning, isComplete, startTimer, pauseTimer, resumeTimer, resetTimer, adjustTime } = useTimer();

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;

  const isIdle = !isRunning && remainingSeconds === 0;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <div className={`fixed z-50 bg-white shadow-xl flex flex-col
        bottom-0 left-0 right-0 rounded-t-2xl max-h-[90vh]
        md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:right-auto md:rounded-2xl md:w-[360px] md:max-h-[90vh]
        ${isComplete ? 'animate-pulse' : ''}`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1 md:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-bold text-lg">쉬는 시간</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 active:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center">
            ✕
          </button>
        </div>

        {/* Timer display */}
        <div className="flex flex-col items-center py-8 px-4 flex-1 overflow-y-auto">
          {/* Circular progress */}
          <div className="relative w-48 h-48 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={remainingSeconds <= 10 && remainingSeconds > 0 ? '#ef4444' : remainingSeconds <= 30 && remainingSeconds > 0 ? '#f59e0b' : '#3b82f6'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${progress * 283} 283`}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold tabular-nums">
                {minutes}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Adjust buttons */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => adjustTime(-15)}
              disabled={remainingSeconds < 15 && !isIdle}
              className="w-12 h-12 rounded-full border-2 border-gray-300 text-gray-600 font-bold text-sm hover:bg-gray-50 active:bg-gray-100 disabled:opacity-30 transition"
            >
              -15
            </button>
            <button
              onClick={() => adjustTime(15)}
              className="w-12 h-12 rounded-full border-2 border-gray-300 text-gray-600 font-bold text-sm hover:bg-gray-50 active:bg-gray-100 transition"
            >
              +15
            </button>
          </div>

          {/* Control buttons */}
          <div className="flex gap-3 w-full px-4">
            {isIdle ? (
              <div className="flex-1" />
            ) : isRunning ? (
              <button
                onClick={pauseTimer}
                className="flex-1 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 active:bg-yellow-700 transition min-h-[48px]"
              >
                일시정지
              </button>
            ) : (
              <button
                onClick={resumeTimer}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition min-h-[48px]"
              >
                계속
              </button>
            )}
            {!isIdle && (
              <button
                onClick={resetTimer}
                className="py-3 px-5 border-2 border-gray-300 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition min-h-[48px]"
              >
                리셋
              </button>
            )}
          </div>
        </div>

        {/* Presets */}
        <div className="px-4 py-4 border-t border-gray-100 env-safe-bottom">
          <p className="text-xs text-gray-400 mb-2 font-medium">프리셋</p>
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.seconds}
                onClick={() => startTimer(p.seconds)}
                className="flex-1 py-2.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 transition min-h-[44px]"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
