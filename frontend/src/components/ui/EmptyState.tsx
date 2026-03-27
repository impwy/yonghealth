import Link from 'next/link';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-base font-semibold text-gray-700 mb-1">{title}</p>
      {description && <p className="text-sm text-gray-400 mb-4 text-center">{description}</p>}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 active:bg-primary-700 transition min-h-[44px] flex items-center"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 active:bg-primary-700 transition min-h-[44px]"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
