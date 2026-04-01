'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: '헬스', icon: '🏋️', match: (p: string) => !p.startsWith('/football') },
  { href: '/football', label: '풋볼', icon: '⚽', match: (p: string) => p.startsWith('/football') },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* 모바일: 가로 탭 바 */}
      <div className="flex md:hidden border-b border-gray-200 bg-white">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* 데스크탑: 세로 사이드바 */}
      <aside className="hidden md:flex flex-col w-16 border-r border-gray-200 bg-white shrink-0">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-4 gap-1 transition-colors ${
                active
                  ? 'text-primary-600 bg-primary-50 border-r-2 border-primary-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </aside>
    </>
  );
}
