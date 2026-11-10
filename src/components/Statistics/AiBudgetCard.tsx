// On the Statistics page's "AI tokens" tab: the App's daily AI token cap,
// today's use against it, and the pause when the cap is reached. Anyone who
// can see the statistics sees the card; changing the cap needs the App's
// settings permission (the API answers 403 otherwise).
import { DateTime } from 'luxon';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AppAiBudget, httpGetAppAiBudget, httpSetAppAiBudget } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { aiUsageKindLabel } from './aiUsageKinds';

function fmt(n: number) {
  return (Number(n) || 0).toLocaleString('en-US');
}

const BAR: Record<AppAiBudget['state'], string> = {
  ok: 'bg-brand-500',
  warning: 'bg-amber-500',
  paused: 'bg-red-500',
};

export const AiBudgetCard: React.FC<{ appId: string }> = ({ appId }) => {
  const { t } = useTranslation();
  const [budget, setBudget] = useState<AppAiBudget | null>(null);
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState('');
  const [indexDraft, setIndexDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const apply = useCallback((b: AppAiBudget | null) => {
    setBudget(b);
    setDraft(b?.appDailyTokenCap != null ? String(b.appDailyTokenCap) : '');
    setIndexDraft(b?.indexing?.appDailyTokenCap != null ? String(b.indexing.appDailyTokenCap) : '');
  }, []);

  useEffect(() => {
    if (!appId) return;
    let cancelled = false;
    setFailed(false);
    httpGetAppAiBudget(appId)
      .then((r) => { if (!cancelled) apply(r.data?.result || null); })
      .catch(() => { if (!cancelled) { apply(null); setFailed(true); } });
    return () => { cancelled = true; };
  }, [appId, apply]);

  const save = async (caps: { dailyTokenCap?: number | null; dailyIndexingTokenCap?: number | null }) => {
    setSaving(true);
    try {
      const r = await httpSetAppAiBudget(appId, caps);
      apply(r.data?.result || null);
      toast.success(t('aiBudget.saved'));
    } catch (e) {
      const err = e as { message?: string; response?: { data?: { error?: string } } };
      toast.error(`${t('aiBudget.saveFailed')} ${err.response?.data?.error || err.message || ''}`);
    } finally {
      setSaving(false);
    }
  };

  // An older API without the endpoint, or no permission: no card.
  if (failed || !budget) return null;

  const capped = budget.dailyTokenCap > 0;
  const share = capped ? Math.min(100, Math.round((budget.usedToday / budget.dailyTokenCap) * 100)) : 0;
  const resets = DateTime.fromISO(budget.resetsAt).toLocaleString(DateTime.DATETIME_SHORT);
  const parse = (v: string) => (v.trim() === '' ? null : Number(v));
  const isValid = (n: number | null) => n === null || (Number.isInteger(n) && n >= 0);
  const parsed = parse(draft);
  const draftValid = isValid(parsed);
  const indexing = budget.indexing;
  const indexParsed = parse(indexDraft);
  const counted = budget.countedKinds.map((k) => aiUsageKindLabel(t, k)).join(', ');

  return (
    <div className="mb-6 rounded-xl border p-4" data-testid="ai-budget-card">
      {budget.state === 'paused' && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700" data-testid="ai-budget-paused">
          {t('aiBudget.paused').replace('{time}', resets)}
        </div>
      )}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-sm font-semibold text-gray-700">{t('aiBudget.title')}</div>
        <div className="text-xs text-gray-500">
          {capped
            ? t('aiBudget.usedOfCap').replace('{used}', fmt(budget.usedToday)).replace('{cap}', fmt(budget.dailyTokenCap)).replace('{share}', String(share))
            : t('aiBudget.usedNoCap').replace('{used}', fmt(budget.usedToday))}
        </div>
      </div>
      {capped && (
        <div className="h-2 bg-gray-100 rounded mt-2">
          <div className={`h-2 rounded ${BAR[budget.state]}`} style={{ width: `${Math.max(share, budget.usedToday > 0 ? 1 : 0)}%` }} />
        </div>
      )}
      <p className="text-xs text-gray-500 mt-2">
        {budget.capSource === 'server'
          ? (capped ? t('aiBudget.serverDefault').replace('{cap}', fmt(budget.dailyTokenCap)) : t('aiBudget.noCap'))
          : (capped ? t('aiBudget.ownCap') : t('aiBudget.ownNoCap'))}
        {' '}
        {t('aiBudget.explain').replace('{warn}', String(Math.round(budget.warnAt * 100))).replace('{kinds}', counted)}
      </p>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <label className="text-xs text-gray-600" htmlFor="ai-budget-cap">{t('aiBudget.capLabel')}</label>
        <input
          id="ai-budget-cap"
          type="number"
          min={0}
          step={1000}
          inputMode="numeric"
          className="w-40 rounded-lg border px-2 py-1 text-sm"
          placeholder={t('aiBudget.capPlaceholder')}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          data-testid="ai-budget-input"
        />
        <button
          type="button"
          className="hover:bg-brand-darker py-[6px] px-4 rounded-xl bg-brand-500 text-white disabled:opacity-50 text-sm"
          disabled={saving || !draftValid || parsed === budget.appDailyTokenCap}
          onClick={() => save({ dailyTokenCap: parsed })}
          data-testid="ai-budget-save"
        >
          {t('aiBudget.save')}
        </button>
        {budget.appDailyTokenCap != null && (
          <button
            type="button"
            className="py-[6px] px-3 rounded-xl border text-sm text-gray-700 disabled:opacity-50"
            disabled={saving}
            onClick={() => save({ dailyTokenCap: null })}
          >
            {t('aiBudget.useDefault')}
          </button>
        )}
      </div>
      <p className="text-[11px] text-gray-400 mt-1">{t('aiBudget.capHint')}</p>
      {indexing && (
        <div className="mt-4 border-t pt-3" data-testid="ai-budget-indexing">
          <div className="text-sm font-semibold text-gray-700">{t('aiBudget.indexingTitle')}</div>
          <p className="text-xs text-gray-500 mt-1">
            {indexing.dailyTokenCap > 0
              ? t('aiBudget.indexingUsed').replace('{used}', fmt(indexing.reservedToday)).replace('{cap}', fmt(indexing.dailyTokenCap))
              : t('aiBudget.indexingNoCap')}
            {' '}
            {indexing.capSource === 'server' && indexing.dailyTokenCap > 0 ? t('aiBudget.indexingServerDefault') : ''}
            {' '}
            {t('aiBudget.indexingExplain')}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <label className="text-xs text-gray-600" htmlFor="ai-budget-indexing-cap">{t('aiBudget.capLabel')}</label>
            <input
              id="ai-budget-indexing-cap"
              type="number"
              min={0}
              step={10000}
              inputMode="numeric"
              className="w-40 rounded-lg border px-2 py-1 text-sm"
              placeholder={t('aiBudget.capPlaceholder')}
              value={indexDraft}
              onChange={(e) => setIndexDraft(e.target.value)}
              data-testid="ai-budget-indexing-input"
            />
            <button
              type="button"
              className="hover:bg-brand-darker py-[6px] px-4 rounded-xl bg-brand-500 text-white disabled:opacity-50 text-sm"
              disabled={saving || !isValid(indexParsed) || indexParsed === indexing.appDailyTokenCap}
              onClick={() => save({ dailyIndexingTokenCap: indexParsed })}
              data-testid="ai-budget-indexing-save"
            >
              {t('aiBudget.save')}
            </button>
            {indexing.appDailyTokenCap != null && (
              <button
                type="button"
                className="py-[6px] px-3 rounded-xl border text-sm text-gray-700 disabled:opacity-50"
                disabled={saving}
                onClick={() => save({ dailyIndexingTokenCap: null })}
              >
                {t('aiBudget.useDefault')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
