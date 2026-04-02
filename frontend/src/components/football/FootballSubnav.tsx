'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    href: '/football',
    label: '팀 생성',
    description: '참가 멤버 선택과 랜덤 편성',
    match: (pathname: string) => pathname === '/football',
  },
  {
    href: '/football/manage',
    label: '풋볼 관리',
    description: '회원 등록, 수정, 삭제',
    match: (pathname: string) => pathname.startsWith('/football/manage'),
  },
];

export default function FootballSubnav() {
  const pathname = usePathname();

  return (
    <section className="football-panel rounded-2xl p-3 md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-football-700">
            SundayFC Tabs
          </p>
          <h2 className="mt-1 text-base font-bold text-gray-900">풋볼 하위 메뉴</h2>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {tabs.map((tab) => {
            const active = tab.match(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-2xl border px-4 py-3 transition ${
                  active
                    ? 'border-football-700 bg-football-700 text-white shadow-[0_14px_30px_rgba(21,128,61,0.2)]'
                    : 'border-emerald-100 bg-emerald-50/60 text-football-900 hover:border-emerald-200 hover:bg-white'
                }`}
              >
                <p className="text-sm font-semibold">{tab.label}</p>
                <p className={`mt-1 text-xs ${active ? 'text-emerald-50/90' : 'text-gray-500'}`}>
                  {tab.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
