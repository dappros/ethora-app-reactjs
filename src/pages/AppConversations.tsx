import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { WidgetConversationsPanel } from '../components/AIWidget/WidgetConversationsPanel';
import { useAppRequests } from '../hooks/useAppRequests';
import { useTranslation } from '../i18n/useTranslation';

// The App's conversations: website visitor chats, and the requests its
// assistants collected (completed flows: bookings, contact forms).
export default function AppConversations() {
  const { t } = useTranslation();
  const { appId } = useParams();
  const [params, setParams] = useSearchParams();
  const view = params.get('view') === 'requests' ? 'requests' : 'chats';
  const openRoom = params.get('room') || undefined;
  if (!appId) return null;
  const tab = (key: 'chats' | 'requests', label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={view === key}
      onClick={() => setParams(key === 'requests' ? { view: 'requests' } : {}, { replace: true })}
      className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${view === key ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:text-gray-900'}`}
    >
      {label}
    </button>
  );
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" className="flex gap-1" data-testid="conversations-views">
          {tab('chats', t('appConversations.chats'))}
          {tab('requests', t('appConversations.requests'))}
        </div>
        <NotificationsMenu appId={appId} />
      </div>
      {view === 'requests' ? <AppRequestsList appId={appId} /> : <WidgetConversationsPanel appId={appId} openRoom={openRoom} />}
    </div>
  );
}

// Where to be told about completed conversations: the owner's email switch
// (Account > Email reports) and the App's webhook.
function NotificationsMenu({ appId }: { appId: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        data-testid="conversations-notifications"
      >
        {t('appConversations.notifications')}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-72 rounded-xl border border-gray-200 bg-white p-2 text-sm shadow-lg">
          <Link className="block rounded-lg px-3 py-2 hover:bg-gray-50" to={`/app/account?tab=${encodeURIComponent('Email reports')}`}>
            {t('appConversations.notifyEmail')}
          </Link>
          <Link className="block rounded-lg px-3 py-2 hover:bg-gray-50" to={`/app/admin/apps/${appId}/settings?tab=Webhooks`}>
            {t('appConversations.notifyWebhook')}
          </Link>
        </div>
      )}
    </div>
  );
}

function AppRequestsList({ appId }: { appId: string }) {
  const { t } = useTranslation();
  const { items, loading, skipped, capped } = useAppRequests(appId);
  const [open, setOpen] = useState<string | null>(null);
  if (loading) return <p className="text-sm text-gray-500">{t('appConversations.loading')}</p>;
  return (
    <section data-testid="app-requests">
      <p className="mb-3 text-sm text-gray-600">{t('appConversations.requestsIntro')}</p>
      {items.length === 0 && <p className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600">{t('appConversations.noRequests')}</p>}
      <ul className="divide-y rounded-xl border border-gray-200">
        {items.map((r) => (
          <li key={r.id}>
            <button type="button" className="flex w-full items-start justify-between gap-3 p-3 text-left hover:bg-gray-50" aria-expanded={open === r.id} onClick={() => setOpen(open === r.id ? null : r.id)}>
              <span className="min-w-0">
                <span className="block font-medium">{r.flow}</span>
                <span className="block truncate text-sm text-gray-600">{r.answers.slice(0, 2).map((a) => a.value).filter(Boolean).join(' · ')}</span>
              </span>
              <span className="shrink-0 text-xs text-gray-500">{r.completedAt ? new Date(r.completedAt).toLocaleString() : ''}</span>
            </button>
            {open === r.id && (
              <dl className="grid gap-x-4 gap-y-1 bg-gray-50 px-3 pb-3 pt-1 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                {r.answers.map((a) => (
                  <div key={a.id} className="contents">
                    <dt className="text-gray-600">{a.question}</dt>
                    <dd className="break-words">{a.value || '-'}</dd>
                  </div>
                ))}
                <dd className="mt-1 sm:col-span-2">
                  <Link className="text-brand-500 underline" to={`/app/admin/agents/${r.agentId}/settings?tab=Flows&fromApp=${appId}`}>{t('appConversations.manageInFlows')}</Link>
                </dd>
              </dl>
            )}
          </li>
        ))}
      </ul>
      {(capped || skipped > 0) && (
        <p className="mt-2 text-xs text-gray-500">
          {capped && t('appConversations.capped')} {skipped > 0 && t('appConversations.skipped').replace('{n}', String(skipped))}
        </p>
      )}
    </section>
  );
}
