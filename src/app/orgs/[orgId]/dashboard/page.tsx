import { TrendingDown, TrendingUp } from 'lucide-react';

interface Props {
  params: Promise<{ orgId: string }>;
}

interface KpiCard {
  label: string;
  value: string;
  delta: string;
  direction: 'up' | 'down' | 'flat';
  hint: string;
}

const DUMMY_KPIS: KpiCard[] = [
  {
    label: 'Leads ingested',
    value: '2,318',
    delta: '+12.4%',
    direction: 'up',
    hint: 'vs. last 7 days',
  },
  {
    label: 'Calls placed',
    value: '1,942',
    delta: '+8.1%',
    direction: 'up',
    hint: 'vs. last 7 days',
  },
  {
    label: 'Qualified rate',
    value: '37.8%',
    delta: '-1.2 pts',
    direction: 'down',
    hint: 'vs. last 7 days',
  },
  {
    label: 'Avg time to contact',
    value: '2m 41s',
    delta: '-18s',
    direction: 'up',
    hint: 'vs. last 7 days',
  },
];

const RECENT_CALLS = [
  { id: 'C-9412', outcome: 'answered_complete', bucket: 'high', time: '2 min ago' },
  { id: 'C-9411', outcome: 'voicemail', bucket: 'med', time: '6 min ago' },
  { id: 'C-9410', outcome: 'answered_complete', bucket: 'high', time: '8 min ago' },
  { id: 'C-9409', outcome: 'no_pickup', bucket: '—', time: '12 min ago' },
  { id: 'C-9408', outcome: 'answered_partial', bucket: 'med', time: '14 min ago' },
];

const FUNNEL = [
  { stage: 'Ingested', count: 2318 },
  { stage: 'Contacted', count: 1942 },
  { stage: 'Qualified', count: 734 },
  { stage: 'High intent', count: 412 },
  { stage: 'Handed off', count: 388 },
];

export default async function DashboardPage({ params }: Props) {
  const { orgId } = await params;
  const max = Math.max(...FUNNEL.map((f) => f.count));
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Showing dummy data for org{' '}
          <span className="font-mono">{orgId}</span>. Real analytics will land
          when the lead → call → score pipeline ships.
        </p>
      </header>

      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="KPI cards"
      >
        {DUMMY_KPIS.map((k) => {
          const Arrow = k.direction === 'down' ? TrendingDown : TrendingUp;
          const deltaColor =
            k.direction === 'down' ? 'text-red-600' : 'text-emerald-600';
          return (
            <article
              key={k.label}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="text-xs uppercase tracking-wide text-gray-500">
                {k.label}
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                {k.value}
              </div>
              <div className={`mt-1 flex items-center gap-1 text-sm ${deltaColor}`}>
                <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{k.delta}</span>
                <span className="text-xs text-gray-400">· {k.hint}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        aria-label="Detail panels"
      >
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Funnel (last 7 days)
          </h2>
          <ul className="space-y-2">
            {FUNNEL.map((f) => (
              <li key={f.stage}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">{f.stage}</span>
                  <span className="font-mono text-gray-900">{f.count}</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full bg-gray-900"
                    style={{ width: `${(f.count / max) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Recent calls
          </h2>
          <ul className="space-y-2 text-sm">
            {RECENT_CALLS.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0"
              >
                <div className="flex flex-col">
                  <span className="font-mono text-gray-700">{c.id}</span>
                  <span className="text-xs text-gray-400">{c.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs ${
                      c.bucket === 'high'
                        ? 'bg-emerald-50 text-emerald-700'
                        : c.bucket === 'med'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    {c.bucket}
                  </span>
                  <span className="font-mono text-xs text-gray-500">
                    {c.outcome}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
