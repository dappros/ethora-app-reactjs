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
  licensed: 'bg-green-100 text-green-800',
  grace: 'bg-amber-100 text-amber-900',
  restricted: 'bg-red-100 text-red-800',
};

export default function AdminLicense() {
  const { t } = useTranslation();
  const { status, refresh } = useLicenseStatus();
  const currentUser = useAppStore((s) => s.currentUser);
  const canEdit = Boolean(currentUser?.isSuperAdmin?.write);

  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

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
      const err = e as AxiosError<{ code?: string; details?: { reason?: string } }>;
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

  const rows: Array<[string, string]> = status
    ? [
        [t('adminLicense.rowState'), t(`licenseState.${status.state}`)],
        [t('adminLicense.rowReason'), t(`licenseReason.${status.reason}`)],
        [t('adminLicense.rowSource'), t(`licenseSource.${status.source}`)],
        [t('adminLicense.rowCustomer'), status.license?.customer || '-'],
        [t('adminLicense.rowLicenseId'), status.license?.lid || '-'],
        [t('adminLicense.rowDomain'), status.license?.domain || '-'],
        [t('adminLicense.rowExpires'), fmtDate(status.license?.expiresAt)],
        [t('adminLicense.rowGraceEnds'), fmtDate(status.graceEndsAt)],
        [t('adminLicense.rowInstalled'), fmtDate(status.installedAt)],
        [t('adminLicense.rowFeatures'), status.features.includes('*') ? t('adminLicense.allFeatures') : status.features.join(', ') || '-'],
        [t('adminLicense.rowHosts'), status.hosts.join(', ') || '-'],
        [
          t('adminLicense.rowCallHome'),
          !status.callHome.enabled
            ? t('adminLicense.callHomeDisabled')
            : !status.callHome.serverConfigured
              ? t('adminLicense.callHomeNoServer')
              : status.callHome.lastAt
                ? `${fmtDate(status.callHome.lastAt)} (${status.callHome.lastStatus})`
                : t('adminLicense.callHomeNever'),
        ],
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
                  {t(`licenseState.${status.state}`)}
                </span>
                <button type="button" onClick={() => refresh()} className="text-sm text-brand-500 underline">
                  {t('adminLicense.refresh')}
                </button>
              </div>

              {status.keyError && (
                <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-800 p-4 text-sm">
                  <div className="font-semibold">{t('adminLicense.keyErrorHeading')}</div>
                  <div>{t(`licenseReason.${status.keyError.reason}`)}</div>
                  {status.keyError.mismatchedHosts.length > 0 && (
                    <div className="mt-1 text-xs">{t('adminLicense.mismatchedHosts')}: {status.keyError.mismatchedHosts.join(', ')}</div>
                  )}
                </div>
              )}

              {status.state === 'restricted' && (
                <p className="mb-6 text-sm text-red-800">{t('adminLicense.restrictedExplain')}</p>
              )}
              {status.state === 'grace' && (
                <p className="mb-6 text-sm text-amber-900">{t('adminLicense.graceExplain')}</p>
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
              {message && (
                <span className={cn('text-sm', message.kind === 'ok' ? 'text-green-700' : 'text-red-700')}>{message.text}</span>
              )}
            </div>
            {status?.source === 'env' && (
              <p className="mt-4 text-xs text-gray-500">{t('adminLicense.envKeyNote')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
