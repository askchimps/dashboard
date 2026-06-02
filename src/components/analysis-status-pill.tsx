import type { AnalysisStatus } from '@/lib/types';

const MAP: Record<AnalysisStatus, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'Analyzing', cls: 'bg-blue-50 text-blue-700' },
  completed: { label: 'Done', cls: 'bg-emerald-50 text-emerald-700' },
  failed: { label: 'Failed', cls: 'bg-red-50 text-red-700' },
};

export function AnalysisStatusPill({
  status,
  title,
}: {
  status: AnalysisStatus;
  title?: string;
}) {
  const entry = MAP[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' };
  const spinner =
    status === 'in_progress' ? (
      <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500" />
    ) : null;
  return (
    <span
      title={title}
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${entry.cls}`}
    >
      {entry.label}
      {spinner}
    </span>
  );
}
