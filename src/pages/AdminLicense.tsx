import type { AxiosError } from 'axios';
import cn from 'classnames';
import { useState } from 'react';
import { httpV2 } from '../http';
import { setLicenseStatus, useLicenseStatus } from '../hooks/useLicenseStatus';
import { useTranslation } from '../i18n/useTranslation';
import type { LicenseStatus } from '../models';
import { useAppStore } from '../store/useAppStore';

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '-';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

const STATE_CLASS: Record<LicenseStatus['state'], string> = {
  licensed: 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300',
  grace: 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300',
  unlicensed: 'bg-gray-100 text-gray-800 dark:bg-gray-800/60 dark:text-gray-200',
};

const PACKAGE_KEYS = ['ai', 'b2b', 'compliance', 'analytics'] as const;
const LICENSE_TEXT_URL = 'https://github.com/dappros/ethora-install/blob/main/docs/legal/ETHORA_CORE_LICENSE.md';
const FEATURE_SCHEDULE_URL = 'https://github.com/dappros/ethora-install/blob/main/docs/legal/FEATURE_SCHEDULE.md';

type ApiErr = AxiosError<{ code?: string; error?: string; details?: { reason?: string } }>;

export default function AdminLicense() {
  const { t } = useTranslation();
  const { status, refresh } = useLicenseStatus();
  const currentUser = useAppStore((s) => s.currentUser);
  const canEdit = Boolean(currentUser?.isSuperAdmin?.write);

  const [key, setKey] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const isCore = status?.tier === 'core' || status?.tier === 'core-registered';
  const unregistered = status?.tier === 'core';

  const submit = async () => {
    const trimmed = key.replace(/\s+/g, '');
    if (!trimmed) return;
    setBusy(true);
    setMessage(null);
    try {
      const r = await httpV2.put<{ license: LicenseStatus }>('/license', { key: trimmed });
      setLicenseStatus(r.data.license);
      setKey('');
      setMessage({ kind: 'ok', text: t('adminLicense.applied') });
    } catch (e) {
      const err = e as ApiErr;
      const code = err.response?.data?.code;
      const reason = err.response?.data?.details?.reason;
      const text =
        code === 'LICENSE_KEY_INVALID'
          ? `${t('adminLicense.invalidKey')} (${reason || 'invalid'})`
          : code === 'LICENSE_ADMIN_ONLY'
            ? t('adminLicense.adminOnly')
            : t('adminLicense.applyFailed');
      setMessage({ kind: 'error', text });
    } finally {
      setBusy(false);
    }
  };

  const register = async () => {
    const addr = (email || currentUser?.email || '').trim();
    if (!addr) return;
    setBusy(true);
    setMessage(null);
    try {
      const r = await httpV2.post<{ license: LicenseStatus }>('/license/register', { email: addr, customer: company.trim() });
      setLicenseStatus(r.data.license);
      setMessage({ kind: 'ok', text: t('adminLicense.registered') });
    } catch (e) {
      const err = e as ApiErr;
      const detail = err.response?.data?.error;
      const code = err.response?.data?.code;
      setMessage({
        kind: 'error',
        text: code === 'LICENSE_ADMIN_ONLY' ? t('adminLicense.adminOnly') : `${t('adminLicense.registerFailed')}${detail ? `: ${detail}` : ''}`,
      });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const r = await httpV2.delete<{ license: LicenseStatus }>('/license');
      setLicenseStatus(r.data.license);
      setMessage({ kind: 'ok', text: t('adminLicense.removed') });
    } catch {
      setMessage({ kind: 'error', text: t('adminLicense.applyFailed') });
    } finally {
      setBusy(false);
    }
  };

  const usageText = (kind: 'apps' | 'users') => {
    if (!status) return '-';
    const limit = status.limits?.[kind] ?? null;
    const used = status.usage?.[kind]?.used ?? null;
    const usedText = used === null ? '?' : String(used);
    if (limit === null) return `${usedText} (${t('adminLicense.unlimited')})`;
    return t('adminLicense.usageOf').replace('{used}', usedText).replace('{limit}', String(limit));
  };

  const packagesText = () => {
    if (!status) return '-';
    if (status.features.includes('*')) return t('adminLicense.allPackages');
    const names = status.features.map((f) =>
      f === 'core' ? t('adminLicense.packagesCore') : (PACKAGE_KEYS as readonly string[]).includes(f) ? t(`adminLicense.package.${f}`) : f
    );
    return names.join(', ') || '-';
  };

  const expiresText = () => {
    if (!status) return '-';
    if (status.tier === 'core') return t('adminLicense.notApplicable');
    if (status.tier === 'core-registered') return t('adminLicense.neverExpires');
    return fmtDate(status.license?.expiresAt);
  };

  const supportText = () => {
    if (!status) return '-';
    if (status.tier === 'core') return t('adminLicense.supportCommunity');
    if (status.tier === 'core-registered') return t('adminLicense.supportEmail');
    return t('adminLicense.supportEnterprise');
  };

  const rows: Array<[string, string]> = status
    ? [
        [t('adminLicense.rowEdition'), t(`licenseTier.${status.tier}`)],
        [t('adminLicense.rowState'), t(`licenseState.${status.state}`)],
        [t('adminLicense.rowReason'), t(`licenseReason.${status.reason}`)],
        [t('adminLicense.rowApps'), usageText('apps')],
        [t('adminLicense.rowUsers'), usageText('users')],
        [t('adminLicense.rowPackages'), packagesText()],
        [t('adminLicense.rowExpires'), expiresText()],
        ...(status.graceEndsAt && status.state === 'grace' ? [[t('adminLicense.rowGraceEnds'), fmtDate(status.graceEndsAt)] as [string, string]] : []),
        [t('adminLicense.rowLicenseId'), status.license?.lid || '-'],
        [t('adminLicense.rowCustomer'), status.license?.customer || '-'],
        [t('adminLicense.rowDomain'), status.license?.domain || '-'],
        [t('adminLicense.rowSupport'), supportText()],
        [t('adminLicense.rowSource'), t(`licenseSource.${status.source}`)],
        [t('adminLicense.rowInstalled'), fmtDate(status.installedAt)],
        [t('adminLicense.rowHosts'), status.hosts.join(', ') || '-'],
        ...(status.callHome.serverConfigured
          ? [[
              t('adminLicense.rowCallHome'),
              !status.callHome.enabled
                ? t('adminLicense.callHomeDisabled')
                : status.callHome.lastAt
                  ? `${fmtDate(status.callHome.lastAt)} (${status.callHome.lastStatus})`
                  : t('adminLicense.callHomeNever'),
            ] as [string, string]]
          : []),
        [t('adminLicense.rowInstance'), status.instanceId],
      ]
    : [];

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row md:min-h-[40px] gap-4">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          {t('adminLicense.title')}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 md:p-8 overflow-y-auto">
        <div className="max-w-3xl">
          {status ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <span className={cn('inline-block rounded-full px-3 py-1 text-sm font-semibold', STATE_CLASS[status.state])}>
                  {t(`licenseTier.${status.tier}`)}
                </span>
                <button type="button" onClick={() => refresh()} className="text-sm text-brand-500 underline">
                  {t('adminLicense.refresh')}
                </button>
              </div>

              {status.keyError && (
                <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900/60 dark:text-red-300 p-4 text-sm">
                  <div className="font-semibold">{t('adminLicense.keyErrorHeading')}</div>
                  <div>{t(`licenseReason.${status.keyError.reason}`)}</div>
                  {status.keyError.mismatchedHosts.length > 0 && (
                    <div className="mt-1 text-xs">{t('adminLicense.mismatchedHosts')}: {status.keyError.mismatchedHosts.join(', ')}</div>
                  )}
                </div>
              )}

              {isCore && status.state !== 'grace' && (
                <p className="mb-6 text-sm text-gray-700 dark:text-gray-300">{t('adminLicense.coreExplain')}</p>
              )}
              {status.state === 'grace' && (
                <p className="mb-6 text-sm text-amber-900 dark:text-amber-300">{t('adminLicense.graceExplain')}</p>
              )}

              <dl className="grid grid-cols-1 md:grid-cols-[220px,_1fr] gap-y-2 gap-x-4 text-sm mb-8">
                {rows.map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="break-all">{value}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <p className="text-sm text-gray-500 mb-8">{t('adminLicense.loading')}</p>
          )}

          {unregistered && (
            <div className="rounded-2xl bg-brand-50 dark:bg-brand-950/20 p-6 md:p-8 mb-6">
              <h3 className="font-varela text-[18px] md:text-[20px] mb-3">{t('adminLicense.registerHeading')}</h3>
              <p className="font-sans text-sm text-gray-600 dark:text-gray-300 mb-4">
                {canEdit ? t('adminLicense.registerBody') : t('adminLicense.adminOnly')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  type="email"
                  value={email || currentUser?.email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!canEdit || busy}
                  placeholder={t('adminLicense.registerEmail')}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm disabled:opacity-60"
                />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={!canEdit || busy}
                  placeholder={t('adminLicense.registerCompany')}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm disabled:opacity-60"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={register}
                  disabled={!canEdit || busy || !(email || currentUser?.email)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 text-white hover:bg-brand-darker font-sans text-sm disabled:opacity-50"
                >
                  {t('adminLicense.registerButton')}
                </button>
                {message && (
                  <span className={cn('text-sm', message.kind === 'ok' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400')}>{message.text}</span>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-gray-50 p-6 md:p-8">
            <h3 className="font-varela text-[18px] md:text-[20px] mb-3">{t('adminLicense.installHeading')}</h3>
            <p className="font-sans text-sm text-gray-600 mb-4">
              {canEdit ? t('adminLicense.installBody') : t('adminLicense.adminOnly')}
            </p>
            <textarea
              value={key}
              onChange={(e) => setKey(e.target.value)}
              disabled={!canEdit || busy}
              rows={4}
              spellCheck={false}
              placeholder="ETHORA1...."
              className="w-full rounded-xl border border-gray-300 p-3 font-mono text-xs mb-3 disabled:opacity-60"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={submit}
                disabled={!canEdit || busy || !key.trim()}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 text-white hover:bg-brand-darker font-sans text-sm disabled:opacity-50"
              >
                {t('adminLicense.apply')}
              </button>
              {canEdit && status?.source === 'stored' && (
                <button
                  type="button"
                  onClick={remove}
                  disabled={busy}
                  className="text-sm text-gray-600 underline disabled:opacity-50"
                >
                  {t('adminLicense.remove')}
                </button>
              )}
              {message && !unregistered && (
                <span className={cn('text-sm', message.kind === 'ok' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400')}>{message.text}</span>
              )}
            </div>
            {status?.source === 'env' && (
              <p className="mt-4 text-xs text-gray-500">{t('adminLicense.envKeyNote')}</p>
            )}
          </div>

          <p className="mt-6 text-xs text-gray-500">
            <a href={LICENSE_TEXT_URL} target="_blank" rel="noreferrer" className="underline">{t('adminLicense.licenseTextLink')}</a>
            {' | '}
            <a href={FEATURE_SCHEDULE_URL} target="_blank" rel="noreferrer" className="underline">{t('adminLicense.featureScheduleLink')}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
