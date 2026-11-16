import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BookACallModal } from '../components/modal/BookACallModal';
import { useTranslation } from '../i18n/useTranslation';
import {
  httpGetBilling,
  httpOpenBillingPortal,
  httpStartBillingCheckout,
  type BillingApp,
  type BillingInterval,
  type BillingOverview,
  type BillingPlan,
  type BillingPlanId,
} from '../http';

// Hosted plans, bought per App through Stripe Checkout (backend
// modules/billing). An App on Free sees the plan cards; a paid App sees its
// plan and a link to the Stripe Customer Portal. Self-hosted installs
// (billing disabled) keep the plain "Free plan / book a call" page.

const PLAN_ORDER: BillingPlanId[] = ['free', 'ai_assistant', 'small_business', 'enterprise'];
const FEATURE_COUNT: Record<BillingPlanId, number> = { free: 4, ai_assistant: 4, small_business: 5, enterprise: 4 };
const POLL_MS = 2000;
const POLL_MAX = 20;

function formatMoney(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString() : '';
}

function fill(text: string, vars: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

function errorText(err: unknown) {
  const e = err as { response?: { data?: { error?: string } }; message?: string } | null;
  return e?.response?.data?.error || e?.message || '';
}

export default function AdminBilling() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [overview, setOverview] = useState<BillingOverview | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [interval, setBillingInterval] = useState<BillingInterval>('month');
  const [selectedAppId, setSelectedAppId] = useState<string>(searchParams.get('appId') || '');
  const [busy, setBusy] = useState<string | null>(null);
  const [activating, setActivating] = useState(searchParams.get('checkout') === 'success');
  const [showBookACall, setShowBookACall] = useState(false);
  const pollCount = useRef(0);

  const load = useCallback(async () => {
    try {
      const { data } = await httpGetBilling();
      setOverview(data.result);
      setLoadFailed(false);
      return data.result;
    } catch {
      // 404 on servers whose API predates billing: show the plain page.
      setLoadFailed(true);
      return null;
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Default the selection to the first App once the list is in.
  useEffect(() => {
    if (!overview?.apps.length) return;
    if (!overview.apps.some((a) => a.appId === selectedAppId)) setSelectedAppId(overview.apps[0].appId);
  }, [overview, selectedAppId]);

  const selected: BillingApp | undefined = overview?.apps.find((a) => a.appId === selectedAppId);

  // Back from Checkout: the plan is set by Stripe's webhook, a few seconds
  // later at most. Poll until the App shows it, then drop the query params.
  useEffect(() => {
    if (!activating) return;
    if (selected && selected.plan !== 'free') {
      setActivating(false);
      toast.success(t('adminBilling.activated'));
      setSearchParams({}, { replace: true });
      return;
    }
    if (pollCount.current >= POLL_MAX) {
      setActivating(false);
      return;
    }
    const timer = window.setTimeout(() => {
      pollCount.current += 1;
      load();
    }, POLL_MS);
    return () => window.clearTimeout(timer);
  }, [activating, selected, load, setSearchParams, t]);

  useEffect(() => {
    if (searchParams.get('checkout') === 'cancel') {
      toast.info(t('adminBilling.checkoutCanceled'));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, t]);

  const plans = useMemo(() => {
    const byId = new Map((overview?.plans || []).map((p) => [p.id, p]));
    return PLAN_ORDER.map((id) => byId.get(id)).filter(Boolean) as BillingPlan[];
  }, [overview]);
  const hasAnnual = plans.some((p) => p.prices.year);

  async function checkout(plan: BillingPlanId) {
    if (!selected) return;
    setBusy(plan);
    try {
      const { data } = await httpStartBillingCheckout(selected.appId, plan, interval);
      window.location.assign(data.result.url);
    } catch (err) {
      toast.error(`${t('adminBilling.checkoutFailed')} ${errorText(err)}`);
      setBusy(null);
    }
  }

  async function openPortal() {
    setBusy('portal');
    try {
      const { data } = await httpOpenBillingPortal();
      window.location.assign(data.result.url);
    } catch (err) {
      toast.error(`${t('adminBilling.portalFailed')} ${errorText(err)}`);
      setBusy(null);
    }
  }

  const header = (
    <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row md:min-h-[40px] gap-4">
      <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">{t('adminBilling.title')}</div>
    </div>
  );

  const enterpriseBox = (
    <div className="rounded-2xl bg-gray-50 p-6 md:p-8">
      <h3 className="font-varela text-[18px] md:text-[20px] mb-3">{t('adminBilling.enterpriseHeading')}</h3>
      <p className="font-sans text-sm text-gray-600 mb-5">{t('adminBilling.enterpriseBody')}</p>
      <button
        type="button"
        onClick={() => setShowBookACall(true)}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 text-white hover:bg-brand-darker font-sans text-sm"
      >
        {t('adminBilling.bookACall')}
      </button>
    </div>
  );

  const bookACall = showBookACall && <BookACallModal onClose={() => setShowBookACall(false)} />;

  // Self-hosted, or an API without billing: the original page.
  if (loadFailed || (overview && !overview.enabled)) {
    return (
      <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
        {header}
        <div className="rounded-2xl bg-white p-4 md:p-8 overflow-y-auto">
          <div className="max-w-3xl">
            <h2 className="font-varela text-[20px] md:text-[24px] mb-4">{t('adminBilling.freePlanHeading')}</h2>
            <p className="font-sans text-base text-gray-700 mb-8 leading-relaxed">{t('adminBilling.freePlanBody')}</p>
            {enterpriseBox}
          </div>
        </div>
        {bookACall}
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
        {header}
        <div className="rounded-2xl bg-white p-4 md:p-8 text-sm text-gray-500">{t('adminBilling.loading')}</div>
      </div>
    );
  }

  const planName = (id: BillingPlanId) => t(`adminBilling.plan.${id}.name`);

  function statusLine(app: BillingApp) {
    if (app.lastPaymentFailedAt && app.status === 'past_due') return t('adminBilling.statusPastDue');
    if (app.status === 'trialing' && app.trialEnd) return fill(t('adminBilling.statusTrial'), { date: formatDate(app.trialEnd) });
    if (app.cancelAtPeriodEnd && app.currentPeriodEnd) return fill(t('adminBilling.statusCancels'), { date: formatDate(app.currentPeriodEnd) });
    if (app.currentPeriodEnd) return fill(t('adminBilling.statusRenews'), { date: formatDate(app.currentPeriodEnd) });
    return '';
  }

  function priceOf(plan: BillingPlan) {
    if (plan.id === 'free') return { main: formatMoney(0, 'usd'), unit: t('adminBilling.perMonth'), note: t('adminBilling.plan.free.note') };
    if (plan.id === 'enterprise') return { main: t('adminBilling.plan.enterprise.price'), unit: t('adminBilling.perMonth'), note: t('adminBilling.billedMonthly') };
    const p = plan.prices[interval] || plan.prices.month;
    if (!p) return { main: '', unit: '', note: '' };
    const isYear = interval === 'year' && plan.prices.year;
    return {
      main: formatMoney(p.amount, p.currency),
      unit: isYear ? t('adminBilling.perYear') : t('adminBilling.perMonth'),
      note: isYear ? t('adminBilling.billedAnnually') : t('adminBilling.billedMonthly'),
    };
  }

  function planAction(plan: BillingPlan) {
    const current = selected?.plan === plan.id;
    const primary = 'w-full px-5 py-3 rounded-xl bg-brand-500 text-white hover:bg-brand-darker font-sans text-sm disabled:opacity-60';
    const secondary = 'w-full px-5 py-3 rounded-xl border-2 border-brand-500 text-brand-500 hover:bg-brand-50 font-sans text-sm disabled:opacity-60';
    if (current) {
      return <div className="w-full px-5 py-3 rounded-xl bg-gray-100 text-gray-600 text-center font-sans text-sm">{t('adminBilling.currentPlan')}</div>;
    }
    if (plan.id === 'enterprise' || (!plan.selfServe && plan.id !== 'free')) {
      return <button type="button" className={secondary} onClick={() => setShowBookACall(true)}>{t('adminBilling.talkToUs')}</button>;
    }
    if (plan.id === 'free') return null;
    const unavailable = interval === 'year' && !plan.prices.year;
    const trial = plan.trialDays > 0 && overview!.trialAvailable;
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          className={plan.id === 'small_business' ? primary : secondary}
          disabled={!selected || busy !== null || unavailable || activating}
          onClick={() => checkout(plan.id)}
        >
          {busy === plan.id
            ? t('adminBilling.redirecting')
            : trial
              ? fill(t('adminBilling.startTrial'), { days: plan.trialDays })
              : t('adminBilling.subscribe')}
        </button>
        {plan.id === 'small_business' && (
          <button type="button" className="text-sm text-brand-500 underline" onClick={() => setShowBookACall(true)}>
            {t('adminBilling.orTalkToUs')}
          </button>
        )}
        {unavailable && <div className="text-xs text-gray-500 text-center">{t('adminBilling.monthlyOnly')}</div>}
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      {header}
      <div className="rounded-2xl bg-white p-4 md:p-8 overflow-y-auto">
        {overview.apps.length === 0 ? (
          <p className="font-sans text-base text-gray-700">{t('adminBilling.noApps')}</p>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <label className="font-sans text-sm text-gray-600" htmlFor="billing-app">{t('adminBilling.appLabel')}</label>
              <select
                id="billing-app"
                className="border rounded-xl px-3 py-2 font-sans text-sm max-w-full md:min-w-[280px]"
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
              >
                {overview.apps.map((a) => (
                  <option key={a.appId} value={a.appId}>
                    {a.displayName || a.appId} - {planName(a.plan)}
                  </option>
                ))}
              </select>
            </div>

            {activating && (
              <div className="mb-6 rounded-xl bg-brand-50 border border-brand-150 px-4 py-3 text-sm" data-testid="billing-activating">
                {t('adminBilling.activating')}
              </div>
            )}

            {selected && selected.plan !== 'free' ? (
              <div className="max-w-3xl flex flex-col gap-6" data-testid="billing-current">
                <div className="rounded-2xl border p-6 md:p-8">
                  <div className="text-sm text-gray-500 mb-1">{t('adminBilling.currentPlan')}</div>
                  <h2 className="font-varela text-[22px] md:text-[26px] mb-2">
                    {planName(selected.plan)}
                    {selected.interval && (
                      <span className="text-base text-gray-500 font-sans">
                        {' '}· {selected.interval === 'year' ? t('adminBilling.annual') : t('adminBilling.monthly')}
                      </span>
                    )}
                  </h2>
                  {statusLine(selected) && (
                    <p className={`text-sm mb-4 ${selected.status === 'past_due' ? 'text-red-600' : 'text-gray-600'}`}>{statusLine(selected)}</p>
                  )}
                  <p className="text-sm text-gray-700 mb-6">
                    {fill(t('adminBilling.mauUsage'), {
                      used: selected.mau ?? '-',
                      limit: selected.limits.mau === null ? t('adminBilling.unlimited') : selected.limits.mau.toLocaleString(),
                    })}
                  </p>
                  {selected.plan !== 'enterprise' && (
                    <button
                      type="button"
                      onClick={openPortal}
                      disabled={busy !== null}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 text-white hover:bg-brand-darker font-sans text-sm disabled:opacity-60"
                    >
                      {busy === 'portal' ? t('adminBilling.redirecting') : t('adminBilling.manageBilling')}
                    </button>
                  )}
                </div>
                {enterpriseBox}
              </div>
            ) : (
              <>
                {hasAnnual && (
                  <div className="inline-flex rounded-xl bg-gray-100 p-1 mb-6" role="tablist">
                    {(['month', 'year'] as BillingInterval[]).map((iv) => (
                      <button
                        key={iv}
                        type="button"
                        role="tab"
                        aria-selected={interval === iv}
                        onClick={() => setBillingInterval(iv)}
                        className={`px-4 py-2 rounded-lg text-sm font-sans ${interval === iv ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                      >
                        {iv === 'month' ? t('adminBilling.monthly') : t('adminBilling.annual')}
                      </button>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" data-testid="billing-plans">
                  {plans.map((plan) => {
                    const price = priceOf(plan);
                    const featured = plan.id === 'small_business';
                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-2xl border p-6 flex flex-col ${featured ? 'border-brand-500 shadow-md' : ''}`}
                      >
                        {featured && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 text-white text-xs px-3 py-1 font-sans">
                            {t('adminBilling.mostPopular')}
                          </div>
                        )}
                        <h3 className="font-varela text-[20px] mb-3">{planName(plan.id)}</h3>
                        <div className="mb-1">
                          <span className="font-varela text-[34px] leading-none">{price.main}</span>
                          <span className="text-gray-500 text-sm"> {price.unit}</span>
                        </div>
                        <div className="text-sm text-gray-500 mb-4">{price.note}</div>
                        <div className="font-sans text-sm font-semibold">{t(`adminBilling.plan.${plan.id}.limit`)}</div>
                        <div className="font-sans text-sm text-gray-500 mb-5">{t(`adminBilling.plan.${plan.id}.limitNote`)}</div>
                        <div className="mb-5">{planAction(plan)}</div>
                        <div className="border-t pt-4 mt-auto">
                          <div className="font-sans text-sm font-semibold mb-2">{t(`adminBilling.plan.${plan.id}.includes`)}</div>
                          <ul className="flex flex-col gap-1.5">
                            {Array.from({ length: FEATURE_COUNT[plan.id] }, (_, i) => (
                              <li key={i} className="flex gap-2 text-sm text-gray-700">
                                <span className="text-brand-500" aria-hidden>✓</span>
                                {t(`adminBilling.plan.${plan.id}.f${i + 1}`)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
      {bookACall}
    </div>
  );
}
