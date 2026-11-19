import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { httpGetOwnerDigest, httpOwnerDigestTest, httpPutOwnerDigest, OwnerDigestSettings, OwnerDigestUpdate } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';

const browserZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

const apiError = (e: unknown) => {
  const r = (e as { response?: { status?: number; data?: { code?: string } } })?.response;
  return { status: r?.status || 0, code: r?.data?.code || '' };
};

function Switch({ checked, disabled, onChange, label, hint, testId }: { checked: boolean; disabled?: boolean; onChange: (v: boolean) => void; label: string; hint?: string; testId: string }) {
  return (
    <label className={`flex items-start gap-3 py-2 ${disabled ? 'opacity-60' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        role="switch"
        className="mt-0.5 size-4 shrink-0 accent-brand-500"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        data-testid={testId}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-900">{label}</span>
        {hint && <span className="block text-xs text-gray-500">{hint}</span>}
      </span>
    </label>
  );
}

// Account > Email reports: the owner's digest of their Apps (daily, weekly,
// monthly) and, per App, an email when a website conversation is completed.
// Everything is off until turned on here.
export function EmailReports() {
  const { t } = useTranslation();
  const [data, setData] = useState<OwnerDigestSettings | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testState, setTestState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await httpGetOwnerDigest();
      setData(data);
    } catch {
      setError(t('emailReports.loadError'));
    }
  }, [t]);
  useEffect(() => {
    void load();
  }, [load]);

  const save = async (body: OwnerDigestUpdate) => {
    setSaving(true);
    setSaved(false);
    setError('');
    // Show the change at once; the server's answer replaces it.
    const before = data;
    if (data) {
      const { completedApps, ...rest } = body;
      setData({
        ...data,
        settings: { ...data.settings, ...rest },
        apps: completedApps ? data.apps.map((a) => ({ ...a, completedEmail: completedApps[a.appId] ?? a.completedEmail })) : data.apps,
      });
    }
    try {
      // The digests go out at 07:00 in the zone of the browser that turned
      // them on.
      const turningOn = body.daily || body.weekly || body.monthly;
      const { data } = await httpPutOwnerDigest(turningOn ? { ...body, timeZone: browserZone() } : body);
      setData(data);
      setSaved(true);
    } catch {
      setData(before);
      setError(t('emailReports.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    setTestState('sending');
    setTestMessage('');
    try {
      const { data: r } = await httpOwnerDigestTest();
      setTestState('sent');
      setTestMessage(t('emailReports.testSent').replace('{email}', r.to));
    } catch (e) {
      const { status, code } = apiError(e);
      setTestState('error');
      setTestMessage(
        status === 429 ? t('emailReports.testLimit') : code === 'EMAIL_NOT_VERIFIED' ? t('emailReports.notVerified') : status === 503 ? t('emailReports.noMail') : t('emailReports.testError')
      );
    }
  };

  if (!data) {
    return <div className="p-4 text-sm text-gray-600">{error || t('emailReports.loading')}</div>;
  }

  const s = data.settings;
  const locked = !data.available || saving;
  const zone = s.timeZone || 'UTC';
  return (
    <section className="max-w-2xl space-y-6 p-1 md:p-4" data-testid="email-reports">
      <div>
        <h2 className="text-lg font-semibold">{t('emailReports.title')}</h2>
        <p className="mt-1 text-sm text-gray-600">{t('emailReports.intro')}</p>
        <p className="mt-1 text-sm text-gray-600" data-testid="email-reports-personal">{t('emailReports.personal')}</p>
      </div>

      {!data.mailConfigured && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900" data-testid="email-reports-nomail">{t('emailReports.noMail')}</p>
      )}
      {data.mailConfigured && !data.enabled && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{t('emailReports.off')}</p>
      )}
      {data.available && !data.emailVerified && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900" data-testid="email-reports-unverified">
          {t('emailReports.notVerified')} <Link className="underline" to="/app/account?tab=Security">{t('emailReports.verifyLink')}</Link>
        </p>
      )}

      <div className="rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold">{t('emailReports.digestTitle')}</h3>
        <p className="mt-1 text-sm text-gray-600">{t('emailReports.digestText').replace('{email}', data.email || '-')}</p>
        <div className="mt-2 divide-y divide-gray-100">
          <Switch testId="digest-daily" checked={s.daily} disabled={locked} onChange={(v) => void save({ daily: v })} label={t('emailReports.daily')} hint={t('emailReports.dailyHint')} />
          <Switch testId="digest-weekly" checked={s.weekly} disabled={locked} onChange={(v) => void save({ weekly: v })} label={t('emailReports.weekly')} hint={t('emailReports.weeklyHint')} />
          <Switch testId="digest-monthly" checked={s.monthly} disabled={locked} onChange={(v) => void save({ monthly: v })} label={t('emailReports.monthly')} hint={t('emailReports.monthlyHint')} />
          <Switch testId="digest-questions" checked={s.includeQuestions} disabled={locked} onChange={(v) => void save({ includeQuestions: v })} label={t('emailReports.questions')} hint={t('emailReports.questionsHint')} />
        </div>
        <p className="mt-2 text-xs text-gray-500" data-testid="digest-zone">{t('emailReports.when').replace('{zone}', zone)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!data.available || testState === 'sending'}
            onClick={() => void sendTest()}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-50"
            data-testid="digest-test"
          >
            {testState === 'sending' ? t('emailReports.testSending') : t('emailReports.test')}
          </button>
          {testMessage && (
            <span className={`text-sm ${testState === 'error' ? 'text-red-700' : 'text-green-700'}`} role="status" data-testid="digest-test-result">
              {testMessage}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold">{t('emailReports.completedTitle')}</h3>
        <p className="mt-1 text-sm text-gray-600">{t('emailReports.completedText')}</p>
        {data.apps.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">{t('emailReports.noApps')}</p>
        ) : (
          <ul className="mt-2 divide-y divide-gray-100" data-testid="completed-apps">
            {data.apps.map((app) => (
              <li key={app.appId} className="flex flex-wrap items-center justify-between gap-2">
                <Switch
                  testId={`completed-${app.appId}`}
                  checked={app.completedEmail}
                  disabled={locked}
                  onChange={(v) => void save({ completedApps: { [app.appId]: v } })}
                  label={app.name}
                  hint={t('emailReports.completedSwitch')}
                />
                <Link className="text-xs text-brand-500 underline" to={`/app/admin/apps/${app.appId}/settings?tab=Webhooks`}>
                  {t('emailReports.webhookLink')}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="min-h-5 text-sm" role="status">
        {error ? <span className="text-red-700">{error}</span> : saved ? <span className="text-green-700">{t('emailReports.saved')}</span> : null}
      </p>
    </section>
  );
}
