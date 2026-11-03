import type { ReactNode } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { AISectionNav } from './AISectionNav';

export const AI_PRIMARY_ACTION_CLASS = 'inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-darker disabled:opacity-50';
export const AI_SECONDARY_ACTION_CLASS = 'inline-flex h-10 items-center justify-center rounded-xl border border-brand-500 px-4 text-sm text-brand-500 hover:bg-brand-hover';
export const AI_CARD_GRID_CLASS = 'grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3';
export const AI_CARD_CLASS = 'flex min-w-0 flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-brand-500';

/** A single layout contract for the Agents and Widgets lists. */
export function AIWorkspacePage({ title, description, searchLabel, search, onSearch, actions, children }: {
  title: string;
  description: string;
  searchLabel: string;
  search: string;
  onSearch: (value: string) => void;
  actions: ReactNode;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return <div className="flex flex-col gap-4 p-2 md:p-4">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-3xl font-semibold leading-tight">{t('nav.ai')}</h1>
      <AISectionNav />
    </header>
    <section className="flex-1 rounded-2xl border border-gray-200 bg-white p-4 md:p-6" data-testid="ai-workspace-content">
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </div>
      <p className="mt-3 min-h-[60px] text-sm text-gray-500 md:min-h-[20px]">{description}</p>
      <div className="mb-6 mt-4">
        <input type="search" aria-label={searchLabel} placeholder={searchLabel} value={search} onChange={(event) => onSearch(event.target.value)} className="h-10 w-full max-w-md rounded-xl border border-gray-300 bg-gray-50 px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-500" />
      </div>
      {children}
    </section>
  </div>;
}
