'use client';

import { TimerProvider } from '@/contexts/TimerContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <TimerProvider>{children}</TimerProvider>;
}
