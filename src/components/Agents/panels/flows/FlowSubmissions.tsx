// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// "Submissions": the answers of completed flow runs as a table, plus where
// they go. The webhook box sets the endpoint a CRM listens on; the same data is
// also available to pull (b2b token) or to send on demand, and as CSV.

import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import {
  FlowSubmission,
  FlowWebhook,
  httpDeleteFlowSubmission,
  httpExportFlowSubmissionsCsv,
  httpGetFlowWebhook,
  httpListFlowSubmissions,
  httpPushFlowSubmissions,
  httpPutFlowWebhook,
  httpTestFlowWebhook,
} from '../../../../http';
import { useTranslation } from '../../../../i18n/useTranslation';

const PAGE = 25;

const STATUS_STYLE: Record<string, string> = {
  none: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

function errText(e: any) {
  return e?.response?.data?.error || e?.message || 'Error';
}

export const FlowSubmissions: React.FC<{ agentId: string; flowKeys: string[]; isDisabled?: boolean }> = ({ agentId, flowKeys, isDisabled }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<FlowSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [flow, setFlow] = useState('');
  const [delivery, setDelivery] = useState('');
  const [note, setNote] = useState<{ text: string; error?: boolean } | null>(null);

  const [hook, setHook] = useState<FlowWebhook>({ enabled: false, url: '', hasSecret: false });
  const [hookUrl, setHookUrl] = useState('');
  const [hookOn, setHookOn] = useState(false);
  const [secret, setSecret] = useState('');

  const filters = useCallback(() => ({ q: q || undefined, flow: flow || undefined, delivery: delivery || undefined }), [q, flow, delivery]);

  const load = useCallback(
    async (offset: number) => {
      setLoading(true);
      try {
        const r = await httpListFlowSubmissions(agentId, { ...filters(), limit: PAGE, offset });
        setTotal(r.data.total);
        setItems((prev) => (offset ? [...prev, ...r.data.items] : r.data.items));
      } catch (e) {
        setNote({ text: errText(e), error: true });
      } finally {
        setLoading(false);
      }
    },
    [agentId, filters]
  );

  useEffect(() => {
    const id = setTimeout(() => void load(0), 250);
    return () => clearTimeout(id);
  }, [load]);

  useEffect(() => {
    httpGetFlowWebhook(agentId)
      .then((r) => {
        setHook(r.data.webhook);
        setHookUrl(r.data.webhook.url);
        setHookOn(r.data.webhook.enabled);
      })
      .catch(() => {});
  }, [agentId]);

  const saveHook = async (rotateSecret = false) => {
    try {
      const r = await httpPutFlowWebhook(agentId, { enabled: hookOn, url: hookUrl.trim(), rotateSecret });
      setHook(r.data.webhook);
      setSecret(r.data.secret || '');
      setNote({ text: t('agentPanels.flowHookSaved') });
    } catch (e) {
      setNote({ text: errText(e), error: true });
    }
  };

  const testHook = async () => {
    try {
      const r = await httpTestFlowWebhook(agentId);
      setNote(
        r.data.ok
          ? { text: t('agentPanels.flowHookTestOk').replace('{status}', String(r.data.status)) }
          : { text: t('agentPanels.flowHookTestFail').replace('{error}', r.data.error), error: true }
      );
    } catch (e) {
      setNote({ text: errText(e), error: true });
    }
  };

  const pushRows = async (ids?: string[]) => {
    try {
      const r = await httpPushFlowSubmissions(agentId, ids ? { ids } : { ...filters() });
      setNote({ text: t('agentPanels.subsPushed').replace('{sent}', String(r.data.sent)).replace('{matched}', String(r.data.matched)), error: r.data.failed > 0 });
      void load(0);
    } catch (e) {
      setNote({ text: errText(e), error: true });
    }
  };

  const downloadCsv = async () => {
    try {
      const r = await httpExportFlowSubmissionsCsv(agentId, filters());
      const url = URL.createObjectURL(r.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flow-submissions.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setNote({ text: errText(e), error: true });
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm(t('agentPanels.subsDeleteConfirm'))) return;
    try {
      await httpDeleteFlowSubmission(agentId, id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setTotal((n) => Math.max(0, n - 1));
    } catch (e) {
      setNote({ text: errText(e), error: true });
    }
  };

  const input = 'rounded border px-2 py-1 text-sm dark:bg-gray-900 dark:border-gray-700';

  return (
    <div className="space-y-4" data-testid="flows-submissions">
      <section className="rounded border p-3 space-y-2 dark:border-gray-700" data-testid="flows-webhook">
        <h3 className="text-sm font-medium">{t('agentPanels.flowHookTitle')}</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">{t('agentPanels.flowHookHint')}</p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={hookOn} disabled={isDisabled} onChange={(e) => setHookOn(e.target.checked)} data-testid="flows-webhook-enabled" />
          {t('agentPanels.flowHookEnabled')}
        </label>
        <input
          className={classNames(input, 'w-full')}
          placeholder="https://crm.example.com/hooks/ethora"
          value={hookUrl}
          disabled={isDisabled}
          onChange={(e) => setHookUrl(e.target.value)}
          aria-label={t('agentPanels.flowHookUrl')}
          data-testid="flows-webhook-url"
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded bg-brand-500 px-3 py-1 text-sm text-white disabled:opacity-50" disabled={isDisabled} onClick={() => void saveHook(false)} data-testid="flows-webhook-save">
            {t('agentPanels.flowHookSave')}
          </button>
          <button type="button" className="rounded border px-3 py-1 text-sm disabled:opacity-50" disabled={isDisabled || !hook.url} onClick={() => void testHook()} data-testid="flows-webhook-test">
            {t('agentPanels.flowHookTest')}
          </button>
          <button type="button" className="rounded border px-3 py-1 text-sm disabled:opacity-50" disabled={isDisabled || !hookUrl.trim()} onClick={() => void saveHook(true)}>
            {t('agentPanels.flowHookRotate')}
          </button>
        </div>
        {secret && (
          <p className="text-xs break-all" data-testid="flows-webhook-secret">
            {t('agentPanels.flowHookSecretOnce')} <code className="font-mono">{secret}</code>
          </p>
        )}
        {!secret && hook.hasSecret && <p className="text-xs text-gray-500">{t('agentPanels.flowHookHasSecret')}</p>}
        <p className="text-xs text-gray-500 font-mono break-all">{t('agentPanels.flowHookApi').replace('{id}', agentId)}</p>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <input className={input} placeholder={t('agentPanels.subsSearch')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t('agentPanels.subsSearch')} data-testid="flows-subs-search" />
        <select className={input} value={flow} onChange={(e) => setFlow(e.target.value)} aria-label={t('agentPanels.subsFlow')}>
          <option value="">{t('agentPanels.subsAllFlows')}</option>
          {flowKeys.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <select className={input} value={delivery} onChange={(e) => setDelivery(e.target.value)} aria-label={t('agentPanels.subsDelivery')}>
          <option value="">{t('agentPanels.subsAllDelivery')}</option>
          {['pending', 'delivered', 'failed', 'none'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-xs text-gray-500">{t('agentPanels.subsTotal').replace('{n}', String(total))}</span>
        <span className="flex-1" />
        <button type="button" className="rounded border px-3 py-1 text-sm" onClick={() => void downloadCsv()} data-testid="flows-subs-csv">
          {t('agentPanels.subsCsv')}
        </button>
        <button type="button" className="rounded border px-3 py-1 text-sm disabled:opacity-50" disabled={isDisabled || !hook.enabled || !total} onClick={() => void pushRows()} data-testid="flows-subs-push">
          {t('agentPanels.subsPush')}
        </button>
      </div>

      {note && (
        <p className={classNames('text-xs', note.error ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400')} data-testid="flows-subs-note">
          {note.text}
        </p>
      )}

      {!items.length && !loading ? (
        <p className="text-sm text-gray-500" data-testid="flows-subs-empty">{t('agentPanels.subsEmpty')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="flows-subs-table">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="py-1 pr-3 font-medium">{t('agentPanels.subsCompleted')}</th>
                <th className="py-1 pr-3 font-medium">{t('agentPanels.subsFlow')}</th>
                <th className="py-1 pr-3 font-medium">{t('agentPanels.subsAnswers')}</th>
                <th className="py-1 pr-3 font-medium">{t('agentPanels.subsDelivery')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-t align-top dark:border-gray-700" data-testid="flows-subs-row">
                  <td className="py-2 pr-3 whitespace-nowrap">{s.completedAt ? new Date(s.completedAt).toLocaleString() : ''}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{s.flow}</td>
                  <td className="py-2 pr-3">
                    <dl className="space-y-0.5">
                      {s.answers.map((a) => (
                        <div key={a.id} className="flex gap-2">
                          <dt className="text-xs text-gray-500 shrink-0" title={a.question}>{a.id}</dt>
                          <dd className="break-words">{a.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </td>
                  <td className="py-2 pr-3">
                    <span className={classNames('rounded px-2 py-0.5 text-xs', STATUS_STYLE[s.delivery.status])} title={s.delivery.lastError || undefined}>
                      {s.delivery.status}
                      {s.delivery.attempts > 1 ? ` (${s.delivery.attempts})` : ''}
                    </span>
                  </td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <button type="button" className="text-xs underline mr-2 disabled:opacity-40" disabled={isDisabled || !hook.enabled} onClick={() => void pushRows([s.id])}>
                      {t('agentPanels.subsPush')}
                    </button>
                    <button type="button" className="text-xs underline text-red-700 dark:text-red-400 disabled:opacity-40" disabled={isDisabled} onClick={() => void remove(s.id)}>
                      {t('agentPanels.subsDelete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length < total && (
            <button type="button" className="mt-2 rounded border px-3 py-1 text-sm" disabled={loading} onClick={() => void load(items.length)}>
              {t('agentPanels.subsMore')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
