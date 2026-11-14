// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Account > Privacy & Data > Age (docs/TRUST_AND_SAFETY.md section 4): the
// declared age (birth year, 18+ or not, when), and a date-of-birth field to
// set it. Only the birth year is stored. Someone who declared under 18
// cannot declare 18+ themselves (409 AGE_LOCKED); an admin can reset it. The
// section stays hidden on an API without the age endpoints.
import { DateTime } from 'luxon';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { httpGetMyAge, httpSetMyAge } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { MyAge } from '../../models';
import { useAppStore } from '../../store/useAppStore';
import { apiError } from '../../utils/apiError';
import { supportContactHref } from '../../utils/suspension';

const inputClass =
  'rounded-xl bg-gray-100 px-[12px] py-[10px] text-[14px] font-sans outline-none focus:ring-2 focus:ring-brand-500';
const primaryButton =
  'py-[10px] px-6 rounded-xl bg-brand-500 text-white hover:bg-brand-darker disabled:opacity-50';
const secondaryButton =
  'py-[10px] px-6 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover disabled:opacity-50';

const todayIso = () => DateTime.now().toISODate() || '';

export function AgeSection() {
  const { t } = useTranslation();
  const supportContact = useAppStore((s) => s.currentApp?.supportContact);
  const [age, setAge] = useState<MyAge | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'unsupported' | 'error'>('loading');
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(false);
  const [dob, setDob] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await httpGetMyAge();
      setAge(r.data);
      setState('ready');
    } catch (e) {
      const info = apiError(e, '');
      if (info.status === 404) {
        setState('unsupported');
        return;
      }
      setLoadError(info.message);
      setState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (state === 'unsupported' || state === 'loading') return null;

  const declared = Boolean(age && age.isAdult !== null && age.isAdult !== undefined);
  // Under 18 and not allowed to declare 18+ alone.
  const isLocked = locked || Boolean(declared && age?.isAdult === false && age?.canDeclareAdult === false);
  const showForm = !isLocked && (!declared || editing);
  const supportHref = supportContactHref(supportContact);

  const save = async () => {
    setError('');
    const d = DateTime.fromISO(dob);
    if (!dob || !d.isValid || d > DateTime.now() || d.year < 1900) {
      setError(t('trustSafetyAge.invalidDate'));
      return;
    }
    setBusy(true);
    try {
      const r = await httpSetMyAge(dob);
      setAge(r.data);
      setEditing(false);
      setDob('');
      toast.success(t('trustSafetyAge.saved'));
    } catch (e) {
      const info = apiError(e, '');
      if (info.status === 409 && info.code === 'AGE_LOCKED') {
        setLocked(true);
        setEditing(false);
      } else {
        setError(t('trustSafetyAge.failed').replace('{error}', info.message));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="border-t border-gray-200 pt-8 flex flex-col gap-3 max-w-[560px]">
      <div>
        <div className="subtitle1 mbc-16">{t('trustSafetyAge.heading')}</div>
        <p className="text-sm text-gray-500">{t('trustSafetyAge.intro')}</p>
      </div>
      {state === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">{t('trustSafetyAge.loadFailed').replace('{error}', loadError)}</p>
      )}
      {state === 'ready' && (
        <div className="rounded-xl bg-gray-50 p-4 text-sm">
          {declared && age ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span
                className={
                  age.isAdult
                    ? 'px-2 py-0.5 rounded-2xl text-xs bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                    : 'px-2 py-0.5 rounded-2xl text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                }
              >
                {age.isAdult ? t('trustSafetyAge.adult') : t('trustSafetyAge.minor')}
              </span>
              {age.birthYear && <span>{t('trustSafetyAge.birthYear').replace('{year}', String(age.birthYear))}</span>}
              {age.declaredAt && (
                <span className="text-gray-500">
                  {t('trustSafetyAge.declaredAt').replace('{date}', DateTime.fromISO(age.declaredAt).toLocaleString(DateTime.DATE_MED))}
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-600">{t('trustSafetyAge.notDeclared')}</span>
          )}
        </div>
      )}
      {state === 'ready' && isLocked && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300 p-3 text-sm">
          {t('trustSafetyAge.locked')}
          {supportHref && (
            <>
              {' '}
              <a href={supportHref} target="_blank" rel="noopener noreferrer" className="underline">
                {t('trustSafetyAge.contact')}
              </a>
            </>
          )}
        </div>
      )}
      {state === 'ready' && showForm && (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="text-gray-500 text-[12px] font-sans">{t('trustSafetyAge.dobLabel')}</span>
            <input
              type="date"
              className={`${inputClass} max-w-[220px]`}
              value={dob}
              max={todayIso()}
              min="1900-01-01"
              onChange={(e) => setDob(e.target.value)}
              disabled={busy}
              required
            />
          </label>
          <p className="text-[12px] text-gray-500">{t('trustSafetyAge.privacy')}</p>
          {error && <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" className={primaryButton} disabled={busy || !dob}>
              {busy ? t('trustSafetyAge.saving') : t('trustSafetyAge.save')}
            </button>
            {declared && (
              <button
                type="button"
                className={secondaryButton}
                disabled={busy}
                onClick={() => {
                  setEditing(false);
                  setError('');
                  setDob('');
                }}
              >
                {t('trustSafetyAge.cancel')}
              </button>
            )}
          </div>
        </form>
      )}
      {state === 'ready' && declared && !isLocked && !editing && (
        <div>
          <button type="button" className={secondaryButton} onClick={() => setEditing(true)}>
            {t('trustSafetyAge.change')}
          </button>
        </div>
      )}
    </section>
  );
}
