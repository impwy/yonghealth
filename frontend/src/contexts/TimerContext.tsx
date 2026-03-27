'use client';

import { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';

interface TimerState {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  isComplete: boolean;
}

interface TimerContextValue extends TimerState {
  startTimer: (seconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  adjustTime: (delta: number) => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within TimerProvider');
  return ctx;
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TimerState>({
    remainingSeconds: 0,
    totalSeconds: 0,
    isRunning: false,
    isComplete: false,
  });

  const deadlineRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (!deadlineRef.current) return;
    const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
    setState((prev) => {
      if (remaining <= 0 && prev.isRunning) {
        deadlineRef.current = null;
        return { ...prev, remainingSeconds: 0, isRunning: false, isComplete: true };
      }
      return { ...prev, remainingSeconds: remaining };
    });
  }, []);

  const startTicking = useCallback(() => {
    clearTick();
    intervalRef.current = setInterval(tick, 200);
  }, [clearTick, tick]);

  // Notify on complete
  useEffect(() => {
    if (!state.isComplete) return;
    // Vibrate
    navigator.vibrate?.([200, 100, 200, 100, 200]);
    // Sound
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio not available
    }
    // Auto-clear complete flag
    const t = setTimeout(() => setState((p) => ({ ...p, isComplete: false })), 3000);
    return () => clearTimeout(t);
  }, [state.isComplete]);

  // Handle tab visibility
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && deadlineRef.current) {
        tick();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [tick]);

  // Cleanup
  useEffect(() => () => clearTick(), [clearTick]);

  const startTimer = useCallback((seconds: number) => {
    // Unlock audio on user gesture
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    deadlineRef.current = Date.now() + seconds * 1000;
    setState({ remainingSeconds: seconds, totalSeconds: seconds, isRunning: true, isComplete: false });
    startTicking();
  }, [startTicking]);

  const pauseTimer = useCallback(() => {
    clearTick();
    deadlineRef.current = null;
    setState((prev) => ({ ...prev, isRunning: false }));
  }, [clearTick]);

  const resumeTimer = useCallback(() => {
    setState((prev) => {
      if (prev.remainingSeconds <= 0) return prev;
      deadlineRef.current = Date.now() + prev.remainingSeconds * 1000;
      startTicking();
      return { ...prev, isRunning: true };
    });
  }, [startTicking]);

  const resetTimer = useCallback(() => {
    clearTick();
    deadlineRef.current = null;
    setState({ remainingSeconds: 0, totalSeconds: 0, isRunning: false, isComplete: false });
  }, [clearTick]);

  const adjustTime = useCallback((delta: number) => {
    setState((prev) => {
      const newRemaining = Math.max(0, prev.remainingSeconds + delta);
      const newTotal = Math.max(prev.totalSeconds, newRemaining);
      if (prev.isRunning) {
        deadlineRef.current = Date.now() + newRemaining * 1000;
      }
      return { ...prev, remainingSeconds: newRemaining, totalSeconds: newTotal };
    });
  }, []);

  return (
    <TimerContext value={{
      ...state,
      startTimer,
      pauseTimer,
      resumeTimer,
      resetTimer,
      adjustTime,
    }}>
      {children}
    </TimerContext>
  );
}
