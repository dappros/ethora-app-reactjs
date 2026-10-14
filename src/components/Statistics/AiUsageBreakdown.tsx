// Under the Statistics page's "AI tokens" chart: what the tokens in the chosen
// period were spent on, which agents spent them and on which models, from the
// per-App AI usage ledger.
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { AppAiUsage, httpGetAppAiUsage } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { aiUsageKindLabel } from './aiUsageKinds';

function fmt(n: number) {
  return (Number(n) || 0).toLocaleString('en-US');
}

const BreakdownList: React.FC<{ title: string; rows: { key: string; label: string; tokens: number }[]; total: number; testId: string }> = ({ title, rows, total, testId }) => (
  <div className="flex-1 min-w-[14rem]" data-testid={testId}>
    <div className="text-sm font-semibold text-gray-700 mb-2">{title}</div>
    <ul className="space-y-1.5">
      {rows.map((r) => {
        const share = total > 0 ? Math.round((r.tokens / total) * 100) : 0;
        return (
          <li key={r.key} className="text-xs">
            <div className="flex justify-between gap-2">
              <span className="truncate text-gray-700" title={r.label}>{r.label}</span>
              <span className="text-gray-500 whitespace-nowrap">{fmt(r.tokens)} · {share}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded mt-0.5">
              <div className="h-1.5 bg-brand-500 rounded" style={{ width: `${Math.max(share, r.tokens > 0 ? 1 : 0)}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  </div>
);

export const AiUsageBreakdown: React.FC<{ appId: string; startDate: string; endDate: string }> = ({ appId, startDate, endDate }) => {
  const { t } = useTranslation();
  const [usage, setUsage] = useState<AppAiUsage | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!appId) return;
    // The viewer's calendar days, `to` exclusive (the ledger keys UTC days).
    const from = DateTime.fromISO(startDate).toISODate();
    const to = DateTime.fromISO(endDate).plus({ days: 1 }).toISODate();
    if (!from || !to) return;
    let cancelled = false;
    setFailed(false);
    httpGetAppAiUsage(appId, from, to)
      .then((r) => { if (!cancelled) setUsage(r.data?.result || null); })
      .catch(() => { if (!cancelled) { setUsage(null); setFailed(true); } });
    return () => { cancelled = true; };
  }, [appId, startDate, endDate]);

  if (failed) return null;
  if (!usage) return <div className="mt-4 text-xs text-gray-500">{t('aiUsage.loading')}</div>;

  const total = usage.total.totalTokens;
  if (!total) {
    return <div className="mt-4 text-xs text-gray-500" data-testid="ai-usage-breakdown">{t('aiUsage.empty')}</div>;
  }
  const cachedShare = usage.total.inputTokens > 0 ? Math.round((usage.total.cachedInputTokens / usage.total.inputTokens) * 100) : 0;

  return (
    <div className="mt-6 border-t pt-4" data-testid="ai-usage-breakdown">
      <div className="text-sm text-gray-700">
        {t(usage.total.cachedInputTokens > 0 ? 'aiUsage.summary' : 'aiUsage.summaryNoCache')
          .replace('{total}', fmt(total))
          .replace('{input}', fmt(usage.total.inputTokens))
          .replace('{output}', fmt(usage.total.outputTokens))
          .replace('{cached}', String(cachedShare))}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">
        {t('aiUsage.monthToDate').replace('{n}', fmt(usage.monthToDate))}
      </div>
      <div className="flex flex-wrap gap-6 mt-4">
        <BreakdownList
          title={t('aiUsage.byPurpose')}
          testId="ai-usage-by-purpose"
          total={total}
          rows={usage.byKind.map((r) => ({ key: r.kind, label: aiUsageKindLabel(t, r.kind), tokens: r.totalTokens }))}
        />
        <BreakdownList
          title={t('aiUsage.byAgent')}
          testId="ai-usage-by-agent"
          total={total}
          rows={usage.byAgent.map((r) => ({
            key: r.agentId || 'none',
            label: r.agentName || (r.agentId ? t('aiUsage.deletedAgent') : t('aiUsage.noAgent')),
            tokens: r.totalTokens,
          }))}
        />
        <BreakdownList
          title={t('aiUsage.byModel')}
          testId="ai-usage-by-model"
          total={total}
          rows={usage.byModel.map((r) => ({ key: r.model, label: r.model, tokens: r.totalTokens }))}
        />
      </div>
      <p className="text-[11px] text-gray-400 mt-4">
        {t('aiUsage.footnote')}
        {usage.total.estimatedTokens > 0 ? ` ${t('aiUsage.estimatedNote').replace('{n}', fmt(usage.total.estimatedTokens))}` : ''}
      </p>
    </div>
  );
};
