// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// T&S > Overview (docs/TRUST_AND_SAFETY.md section 13): whether Trust &
// Safety is on, the moderation service state and its loaded models, the
// image level and the profile, and count tiles that open the other tabs.
import cn from 'classnames';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { httpGetTsOverview } from '../../../http';
import { useTranslation } from '../../../i18n/useTranslation';
import type { TsOverview } from '../../../models';
import { accessErrorMessage } from '../../../utils/accessError';
import { apiError } from '../../../utils/apiError';
import { hubTabPath } from '../../../utils/tsHub';
import { TabHeader } from './common';

type Tone = 'ok' | 'warn' | 'off' | 'error';

const TONE: Record<Tone, string> = {
  ok: 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300',
  warn: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  off: 'bg-gray-100 text-gray-700',
  error: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
};

function StatusCard({ title, value, tone, children }: { title: string; value: string; tone: Tone; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-4 min-w-0">
      <div className="text-xs text-gray-500 mb-2">{title}</div>
      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-2xl text-sm font-semibold', TONE[tone])}>{value}</span>
      {children && <div className="mt-2 text-xs text-gray-600 break-words">{children}</div>}
    </div>
  );
}

function CountTile({ label, value, to, hint }: { label: string; value: number | null; to: string; hint?: string }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-gray-200 p-4 min-w-0 hover:border-brand-500 hover:bg-gray-50 transition-colors"
      title={hint}
    >
      <div className="font-varela text-[28px] leading-none tabular-nums">{value === null ? '-' : value}</div>
      <div className="mt-2 text-sm text-gray-700">{label}</div>
    </Link>
  );
}

/** The loaded model names, whatever shape the API sends them in. */
function modelNames(models: NonNullable<TsOverview['service']>['models']): string[] {
  if (!models) return [];
  if (Array.isArray(models)) return models.map(String).filter(Boolean);
  return Object.entries(models)
    .filter(([, v]) => v !== false && v !== null)
    .map(([k, v]) => (typeof v === 'string' && v && v !== 'true' ? `${k} (${v})` : k));
}

export function OverviewTab() {
  const { t } = useTranslation();
  const [data, setData] = useState<TsOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await httpGetTsOverview();
      setData(r.data || null);
      setUnavailable(false);
    } catch (e) {
      if (apiError(e, '').status === 404) setUnavailable(true);
      else setError(accessErrorMessage(e, t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const label = (prefix: string, v?: string | null) => {
    if (!v) return t('tsHub.overview.unknown');
    const key = `${prefix}.${v}`;
    const s = t(key);
    return s === key ? v : s;
  };

  const service = data?.service || null;
  const serviceState: { value: string; tone: Tone } = !service
    ? { value: t('tsHub.overview.unknown'), tone: 'off' }
    : service.configured === false
      ? { value: t('tsHub.overview.service.notConfigured'), tone: 'off' }
      : service.ok === false
        ? { value: t('tsHub.overview.service.unreachable'), tone: 'error' }
        : service.ok === true
          ? { value: t('tsHub.overview.service.ok'), tone: 'ok' }
          : { value: t('tsHub.overview.unknown'), tone: 'warn' };
  const models = modelNames(service?.models);
  const counts = data?.counts || {};
  const n = (v?: number) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

  return (
    <div>
      <TabHeader title={t('tsHub.tab.overview')} intro={t('tsHub.overview.intro')} loading={loading} onRefresh={() => void load()} />
      {unavailable && <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl mb-4">{t('tsHub.unavailable')}</div>}
      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{t('tsHub.loadFailed').replace('{error}', error)}</p>}
      {!data && loading && <p className="text-sm text-gray-500">{t('tsHub.loading')}</p>}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
            <StatusCard
              title={t('tsHub.overview.enabled')}
              value={data.enabled ? t('tsHub.overview.on') : t('tsHub.overview.off')}
              tone={data.enabled ? 'ok' : 'off'}
            >
              {!data.enabled && t('tsHub.overview.offHint')}
            </StatusCard>
            <StatusCard title={t('tsHub.overview.service')} value={serviceState.value} tone={serviceState.tone}>
              {models.length > 0
                ? t('tsHub.overview.models').replace('{models}', models.join(', '))
                : service?.configured === false
                  ? t('tsHub.overview.service.notConfiguredHint')
                  : service?.ok === false
                    ? t('tsHub.overview.service.unreachableHint')
                    : null}
            </StatusCard>
            <StatusCard title={t('tsHub.overview.imageLevel')} value={label('trustSafety.level', data.imageLevel)} tone="off" />
            <StatusCard title={t('tsHub.overview.profile')} value={label('serverSettings.option.TS_PROFILE', data.profile)} tone="off">
              <Link to={hubTabPath('settings')} className="text-brand-500 underline">
                {t('tsHub.overview.changeSettings')}
              </Link>
            </StatusCard>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <CountTile label={t('tsHub.overview.count.quarantine')} value={n(counts.quarantineCases)} to={hubTabPath('quarantine')} />
            <CountTile
              label={t('tsHub.overview.count.expiring')}
              value={n(counts.quarantineExpiringSoon)}
              to={hubTabPath('quarantine', { status: 'expiring' })}
            />
            <CountTile label={t('tsHub.overview.count.held')} value={n(counts.quarantineOnHold)} to={hubTabPath('quarantine', { status: 'held' })} />
            <CountTile label={t('tsHub.overview.count.moderation')} value={n(counts.moderationOpen)} to={hubTabPath('moderation')} />
            <CountTile label={t('tsHub.overview.count.suspended')} value={n(counts.suspendedUsers)} to={hubTabPath('suspended')} />
            <CountTile label={t('tsHub.overview.count.rules')} value={n(counts.rules)} to={hubTabPath('rules')} />
          </div>
        </>
      )}
    </div>
  );
}
