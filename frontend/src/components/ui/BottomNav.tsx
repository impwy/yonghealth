'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: '/', label: '홈', icon: '📅' },
    { href: '/workouts/new', label: '기록하기', icon: '➕' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 md:hidden env-safe-bottom">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-[44px] transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400 active:text-gray-600'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
