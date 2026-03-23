import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          YongHealth
        </Link>
        <Link
          href="/workouts/new"
          className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
        >
          + 새 운동 기록
        </Link>
      </div>
    </nav>
  );
}
