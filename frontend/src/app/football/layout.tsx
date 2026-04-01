import type { ReactNode } from 'react';
import FootballSubnav from '@/components/football/FootballSubnav';

interface FootballLayoutProps {
  children: ReactNode;
}

export default function FootballLayout({ children }: FootballLayoutProps) {
  return (
    <div className="space-y-6 pb-6">
      <FootballSubnav />
      {children}
    </div>
  );
}
