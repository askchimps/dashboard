'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export function Pager({ total, page, pageSize, pageCount }: Props) {
  const pathname = usePathname();
  const sp = useSearchParams();

  const hrefFor = (n: number) => {
    const next = new URLSearchParams(sp.toString());
    if (n <= 1) next.delete('page');
    else next.set('page', String(n));
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  if (pageCount <= 1) {
    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
        <span>
          {total} {total === 1 ? 'row' : 'rows'}
        </span>
        <span className="text-gray-400">Page 1 of 1</span>
      </div>
    );
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= pageCount;

  const base =
    'inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100';
  const disabled = 'pointer-events-none border-gray-200 text-gray-300';

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs">
      <span className="text-gray-500">
        Showing <span className="font-medium text-gray-700">{from}</span>–
        <span className="font-medium text-gray-700">{to}</span> of{' '}
        <span className="font-medium text-gray-700">{total}</span>
      </span>
      <nav
        className="flex items-center gap-2"
        aria-label="Pagination"
      >
        <Link
          href={hrefFor(page - 1)}
          aria-disabled={prevDisabled}
          tabIndex={prevDisabled ? -1 : 0}
          className={`${base} ${prevDisabled ? disabled : ''}`.trim()}
          scroll={false}
          prefetch={false}
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Previous page</span>
        </Link>
        <span className="font-mono text-gray-700">
          {page} / {pageCount}
        </span>
        <Link
          href={hrefFor(page + 1)}
          aria-disabled={nextDisabled}
          tabIndex={nextDisabled ? -1 : 0}
          className={`${base} ${nextDisabled ? disabled : ''}`.trim()}
          scroll={false}
          prefetch={false}
        >
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Next page</span>
        </Link>
      </nav>
    </div>
  );
}
