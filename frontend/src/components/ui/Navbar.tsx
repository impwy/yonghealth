import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-3 py-3 md:px-4 flex items-center justify-between">
        <Link href="/" className="text-lg md:text-xl font-bold tracking-tight">
          YongHealth
        </Link>
        <Link
          href="/workouts/new"
          className="hidden md:flex bg-white text-blue-600 px-3 py-2 md:px-4 rounded-lg text-sm font-semibold hover:bg-blue-50 active:bg-blue-100 transition min-h-[44px] items-center"
        >
          + 새 운동 기록
        </Link>
      </div>
    </nav>
  );
}
