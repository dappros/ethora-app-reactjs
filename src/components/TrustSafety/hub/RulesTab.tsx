// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// T&S > Rules (docs/TRUST_AND_SAFETY.md section 13): install-wide word and
// regular expression rules (collection ts_rules). The list with an enabled
// toggle, a dialog to create or edit a rule (with the server's errors per
// pattern), delete, and a test panel that shows which rules match a message
// and the resulting action (POST /rules/test, with the draft of the dialog).
import { Dialog, DialogPanel } from '@headlessui/react';
import cn from 'classnames';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { httpCreateTsRule, httpDeleteTsRule, httpGetTsRules, httpTestTsRules, httpUpdateTsRule } from '../../../http';
import { useTranslation } from '../../../i18n/useTranslation';
import type { TsRule } from '../../../models';
import { accessErrorMessage } from '../../../utils/accessError';
import { apiError } from '../../../utils/apiError';
import {
  EMPTY_RULE_DRAFT,
  RULE_LIMITS,
  RuleBody,
  RuleDraft,
  RuleTestResult,
  TS_RULE_ACTIONS,
  draftToRuleBody,
  normalizeRuleTest,
  patternErrorsFromDetails,
  ruleToDraft,
  splitPatterns,
  validateRuleDraft,
} from '../../../utils/tsHub';
import { Segmented } from '../../AIWidget/appearance/Fields';
import { IconClose } from '../../Icons/IconClose';
import { ConfirmModal } from '../../modal/ConfirmModal';
import { BUTTON_DANGER, BUTTON_PLAIN, TabHeader } from './common';
import { useAppOptions } from './useAppOptions';

const INPUT = 'w-full rounded-xl bg-gray-100 outline-none py-[10px] px-[14px] text-sm font-sans';
const LABEL = 'text-gray-500 text-[12px] font-sans mb-1';
const ERROR = 'text-red-600 dark:text-red-400 text-[12px] mt-1';

// ---- Test panel ----

function RuleTestPanel({ draft, ruleId }: { draft?: RuleBody | null; ruleId?: string }) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RuleTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // An edit of the draft makes the last result stale.
  const draftKey = draft ? JSON.stringify(draft) : '';
  useEffect(() => {
    setResult(null);
    setError(null);
  }, [draftKey]);

  const run = async () => {
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const r = await httpTestTsRules(text, draft ? { ...draft, ...(ruleId ? { _id: ruleId } : {}) } : undefined);
      setResult(normalizeRuleTest(r.data));
    } catch (e) {
      setResult(null);
      const info = apiError(e, '');
      const details = (e as { response?: { data?: { details?: unknown } } })?.response?.data?.details;
      const patternErrors = patternErrorsFromDetails(details);
      setError(Object.keys(patternErrors).length ? t('tsHub.rules.test.draftInvalid') : info.message || accessErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };

  const actionLabel = (a?: string | null) => (a ? t(`tsHub.rules.action.${a}`) : '');

  return (
    <div className="rounded-xl border border-gray-200 p-3 min-w-0">
      <div className="text-sm font-semibold">{t('tsHub.rules.test.title')}</div>
      <p className="text-xs text-gray-500 mb-2">{draft ? t('tsHub.rules.test.introDraft') : t('tsHub.rules.test.intro')}</p>
      <textarea
        aria-label={t('tsHub.rules.test.message')}
        className={`${INPUT} min-h-[72px]`}
        placeholder={t('tsHub.rules.test.placeholder')}
        maxLength={4000}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setResult(null);
        }}
      />
      <div className="mt-2 flex items-center gap-3">
        <button type="button" disabled={busy || !text.trim()} className={BUTTON_PLAIN} onClick={() => void run()}>
          {busy ? t('tsHub.rules.test.running') : t('tsHub.rules.test.run')}
        </button>
        {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
      </div>
      {result && (
        <div className="mt-3 text-sm" aria-live="polite">
          {result.matches.length === 0 ? (
            <p className="text-gray-600">{t('tsHub.rules.test.noMatch')}</p>
          ) : (
            <>
              <p className="font-semibold">
                {t('tsHub.rules.test.resulting').replace('{action}', actionLabel(result.action) || t('tsHub.rules.test.none'))}
              </p>
              <ul className="mt-1 flex flex-col gap-1">
                {result.matches.map((m, i) => (
                  <li key={`${m.id}-${i}`} className="text-xs text-gray-700 break-words">
                    <span className="font-semibold">{m.draft ? t('tsHub.rules.test.thisRule') : m.name || m.id}</span>
                    {': '}
                    {actionLabel(m.action)}
                    {m.matched.length > 0 && (
                      <span className="text-gray-500"> ({t('tsHub.rules.test.matched').replace('{terms}', m.matched.join(', '))})</span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Create / edit dialog ----

interface DialogProps {
  rule: TsRule | null;
  onClose: () => void;
  onSaved: () => void;
}

function RuleDialog({ rule, onClose, onSaved }: DialogProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<RuleDraft>(() => (rule ? ruleToDraft(rule) : EMPTY_RULE_DRAFT));
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // Server errors by pattern index; cleared when the patterns change.
  const [serverPatternErrors, setServerPatternErrors] = useState<Record<number, string>>({});
  const [appQuery, setAppQuery] = useState('');
  const seenApps = useMemo(() => (rule?.appIds || []).map((id) => ({ id, name: null })), [rule]);
  const appOptions = useAppOptions(seenApps);

  const validation = validateRuleDraft(draft);
  const { patterns, lines } = splitPatterns(draft.patternsText);
  const set = (patch: Partial<RuleDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const problemText = (p: string) => t(`tsHub.rules.problem.${p}`).replace('{max}', String(RULE_LIMITS.patternLength));
  const patternLines = patterns
    .map((p, i) => {
      const msg = serverPatternErrors[i] || (validation.patternProblems[i] ? problemText(validation.patternProblems[i]) : '');
      return msg ? { line: lines[i], pattern: p, msg } : null;
    })
    .filter(Boolean) as Array<{ line: number; pattern: string; msg: string }>;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!validation.ok || busy) return;
    setBusy(true);
    setServerError(null);
    setServerPatternErrors({});
    try {
      const body = draftToRuleBody(draft);
      if (rule) await httpUpdateTsRule(rule._id, body);
      else await httpCreateTsRule(body);
      toast.success(rule ? t('tsHub.rules.toast.saved') : t('tsHub.rules.toast.created'));
      onSaved();
    } catch (err) {
      const info = apiError(err, '');
      const details = (err as { response?: { data?: { details?: unknown } } })?.response?.data?.details;
      const perPattern = patternErrorsFromDetails(details);
      setServerPatternErrors(perPattern);
      setServerError(
        Object.keys(perPattern).length ? t('tsHub.rules.patternsRejected') : info.message || accessErrorMessage(err, t)
      );
    } finally {
      setBusy(false);
    }
  };

  const filteredApps = appOptions.filter((a) => !appQuery.trim() || a.name.toLowerCase().includes(appQuery.trim().toLowerCase()));

  return (
    <Dialog className="relative z-50" open onClose={busy ? () => {} : onClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-[720px] max-h-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="font-varela text-[22px] break-words min-w-0">{rule ? t('tsHub.rules.editTitle') : t('tsHub.rules.newTitle')}</div>
            {!busy && (
              <button type="button" onClick={onClose} aria-label={t('tsHub.close')}>
                <IconClose />
              </button>
            )}
          </div>
          <form className="flex flex-col gap-4 font-sans text-sm" onSubmit={save} noValidate>
            <label className="block">
              <div className={LABEL}>{t('tsHub.rules.field.name')}</div>
              <input
                className={INPUT}
                autoFocus
                maxLength={RULE_LIMITS.nameLength + 20}
                value={draft.name}
                onChange={(e) => set({ name: e.target.value })}
              />
              {touched && validation.name && <div className={ERROR}>{t(`tsHub.rules.nameError.${validation.name}`)}</div>}
            </label>

            <div>
              <div className={LABEL}>{t('tsHub.rules.field.kind')}</div>
              <Segmented
                ariaLabel={t('tsHub.rules.field.kind')}
                value={draft.kind}
                onChange={(kind) => {
                  set({ kind });
                  setServerPatternErrors({});
                }}
                options={[
                  { value: 'words', label: t('tsHub.rules.kind.words') },
                  { value: 'regex', label: t('tsHub.rules.kind.regex') },
                ]}
              />
              <p className="text-xs text-gray-500 mt-1">{t(`tsHub.rules.kindHelp.${draft.kind}`)}</p>
            </div>

            <label className="block">
              <div className={LABEL}>
                {t('tsHub.rules.field.patterns')}{' '}
                <span className="tabular-nums">
                  ({t('tsHub.rules.patternCount').replace('{count}', String(patterns.length)).replace('{max}', String(RULE_LIMITS.patterns))})
                </span>
              </div>
              <textarea
                className={cn(`${INPUT} min-h-[140px] font-mono`, patternLines.length && 'border border-red-500')}
                spellCheck={false}
                placeholder={draft.kind === 'regex' ? t('tsHub.rules.placeholder.regex') : t('tsHub.rules.placeholder.words')}
                value={draft.patternsText}
                onChange={(e) => {
                  set({ patternsText: e.target.value });
                  setServerPatternErrors({});
                }}
              />
              {touched && validation.patterns && (
                <div className={ERROR}>{t(`tsHub.rules.patternsError.${validation.patterns}`).replace('{max}', String(RULE_LIMITS.patterns))}</div>
              )}
              {patternLines.length > 0 && (
                <ul className="mt-1 flex flex-col gap-0.5">
                  {patternLines.slice(0, 20).map((p) => (
                    <li key={p.line} className="text-[12px] text-red-600 dark:text-red-400 break-all">
                      {t('tsHub.rules.lineError').replace('{line}', String(p.line)).replace('{pattern}', p.pattern).replace('{error}', p.msg)}
                    </li>
                  ))}
                  {patternLines.length > 20 && (
                    <li className="text-[12px] text-red-600 dark:text-red-400">
                      {t('tsHub.rules.moreErrors').replace('{count}', String(patternLines.length - 20))}
                    </li>
                  )}
                </ul>
              )}
            </label>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <label className={cn('inline-flex items-center gap-2', draft.kind !== 'words' && 'opacity-50')}>
                <input
                  type="checkbox"
                  disabled={draft.kind !== 'words'}
                  checked={draft.kind === 'words' && draft.wholeWords}
                  onChange={(e) => set({ wholeWords: e.target.checked })}
                />
                <span>{t('tsHub.rules.field.wholeWords')}</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={draft.caseSensitive} onChange={(e) => set({ caseSensitive: e.target.checked })} />
                <span>{t('tsHub.rules.field.caseSensitive')}</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={draft.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
                <span>{t('tsHub.rules.field.enabled')}</span>
              </label>
            </div>

            <label className="block">
              <div className={LABEL}>{t('tsHub.rules.field.action')}</div>
              <select className={INPUT} value={draft.action} onChange={(e) => set({ action: e.target.value as RuleDraft['action'] })}>
                {TS_RULE_ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {t(`tsHub.rules.action.${a}`)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">{t(`tsHub.rules.actionHelp.${draft.action}`)}</p>
            </label>

            <fieldset>
              <legend className={LABEL}>{t('tsHub.rules.field.apps')}</legend>
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="ts-rule-apps" checked={draft.allApps} onChange={() => set({ allApps: true })} />
                  <span>{t('tsHub.rules.apps.all')}</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="ts-rule-apps" checked={!draft.allApps} onChange={() => set({ allApps: false })} />
                  <span>{t('tsHub.rules.apps.some')}</span>
                </label>
              </div>
              {!draft.allApps && (
                <div className="mt-2 rounded-xl border border-gray-200 p-2">
                  <input
                    type="search"
                    className={`${INPUT} mb-2`}
                    aria-label={t('tsHub.rules.apps.search')}
                    placeholder={t('tsHub.rules.apps.search')}
                    value={appQuery}
                    onChange={(e) => setAppQuery(e.target.value)}
                  />
                  <div className="max-h-48 overflow-y-auto flex flex-col gap-1">
                    {filteredApps.map((a) => (
                      <label key={a.id} className="inline-flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={draft.appIds.includes(a.id)}
                          onChange={(e) =>
                            set({ appIds: e.target.checked ? [...draft.appIds, a.id] : draft.appIds.filter((x) => x !== a.id) })
                          }
                        />
                        <span className="truncate">{a.name}</span>
                      </label>
                    ))}
                    {!filteredApps.length && <span className="text-xs text-gray-500">{t('tsHub.rules.apps.none')}</span>}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {t('tsHub.rules.apps.selected').replace('{count}', String(draft.appIds.length))}
                  </div>
                </div>
              )}
              {touched && validation.apps && <div className={ERROR}>{t('tsHub.rules.appsError')}</div>}
            </fieldset>

            <RuleTestPanel draft={validation.ok ? draftToRuleBody(draft) : null} ruleId={rule?._id} />

            {serverError && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 text-red-800 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300 p-3">
                {serverError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={busy}
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover disabled:opacity-50"
              >
                {t('tsHub.cancel')}
              </button>
              <button
                type="submit"
                disabled={busy || (touched && !validation.ok)}
                className="w-full py-2.5 rounded-xl border text-white bg-brand-500 border-brand-darker hover:bg-brand-darker disabled:opacity-50"
              >
                {busy ? t('tsHub.saving') : rule ? t('tsHub.rules.save') : t('tsHub.rules.create')}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

// ---- The tab ----

export function RulesTab() {
  const { t } = useTranslation();
  const [rules, setRules] = useState<TsRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [editing, setEditing] = useState<TsRule | 'new' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TsRule | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const appOptions = useAppOptions();
  const appName = useMemo(() => new Map(appOptions.map((a) => [a.id, a.name])), [appOptions]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await httpGetTsRules();
      const data = r.data as unknown;
      setRules(Array.isArray(data) ? (data as TsRule[]) : r.data?.items || []);
      setUnavailable(false);
    } catch (e) {
      if (apiError(e, '').status === 404) setUnavailable(true);
      else setError(accessErrorMessage(e, t));
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async (rule: TsRule) => {
    setBusyId(rule._id);
    try {
      await httpUpdateTsRule(rule._id, { ...draftToRuleBody(ruleToDraft(rule)), enabled: !rule.enabled });
      setRules((list) => list.map((r) => (r._id === rule._id ? { ...r, enabled: !rule.enabled } : r)));
    } catch (e) {
      toast.error(t('tsHub.rules.toast.failed').replace('{error}', accessErrorMessage(e, t)));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete._id);
    try {
      await httpDeleteTsRule(confirmDelete._id);
      toast.success(t('tsHub.rules.toast.deleted'));
      setConfirmDelete(null);
      await load();
    } catch (e) {
      toast.error(t('tsHub.rules.toast.failed').replace('{error}', accessErrorMessage(e, t)));
    } finally {
      setBusyId(null);
    }
  };

  const appsText = (r: TsRule) => {
    const ids = r.appIds || [];
    if (!ids.length) return t('tsHub.rules.apps.all');
    const names = ids.map((id) => appName.get(id) || id);
    return names.length > 3 ? `${names.slice(0, 3).join(', ')} ${t('tsHub.rules.apps.more').replace('{count}', String(names.length - 3))}` : names.join(', ');
  };

  const full = rules.length >= RULE_LIMITS.rules;

  return (
    <div>
      <TabHeader title={t('tsHub.tab.rules')} intro={t('tsHub.rules.intro')} loading={loading} onRefresh={() => void load()} />
      <p className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 max-w-[760px]">{t('tsHub.rules.howItRuns')}</p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={full || unavailable}
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white hover:bg-brand-darker font-sans text-sm disabled:opacity-50"
        >
          {t('tsHub.rules.add')}
        </button>
        <span className="text-xs text-gray-500 tabular-nums">
          {t('tsHub.rules.countOf').replace('{count}', String(rules.length)).replace('{max}', String(RULE_LIMITS.rules))}
        </span>
      </div>

      {unavailable && <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl mb-4">{t('tsHub.unavailable')}</div>}
      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{t('tsHub.loadFailed').replace('{error}', error)}</p>}
      {!loading && !error && !unavailable && !rules.length && (
        <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl mb-4">{t('tsHub.rules.empty')}</div>
      )}

      {rules.length > 0 && (
        <div className="relative overflow-x-auto rounded-2xl border border-gray-200 mb-6">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-[12px] text-gray-500 border-b border-gray-200">
                <th className="py-2 px-3 font-normal">{t('tsHub.rules.col.name')}</th>
                <th className="py-2 px-3 font-normal">{t('tsHub.rules.col.kind')}</th>
                <th className="py-2 px-3 font-normal text-right">{t('tsHub.rules.col.patterns')}</th>
                <th className="py-2 px-3 font-normal">{t('tsHub.rules.col.action')}</th>
                <th className="py-2 px-3 font-normal">{t('tsHub.rules.col.apps')}</th>
                <th className="py-2 px-3 font-normal">{t('tsHub.rules.col.enabled')}</th>
                <th className="py-2 px-3 font-normal sr-only">{t('tsHub.rules.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.map((r) => (
                <tr key={r._id} className={cn('align-top', !r.enabled && 'text-gray-500')}>
                  <td className="py-2 px-3 break-words max-w-[220px]">{r.name}</td>
                  <td className="py-2 px-3 text-xs whitespace-nowrap">
                    {t(`tsHub.rules.kind.${r.kind}`)}
                    {r.kind === 'words' && r.wholeWords !== false && <span className="block text-gray-500">{t('tsHub.rules.wholeWordsShort')}</span>}
                    {r.caseSensitive && <span className="block text-gray-500">{t('tsHub.rules.caseSensitiveShort')}</span>}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums">{(r.patterns || []).length}</td>
                  <td className="py-2 px-3 text-xs">{t(`tsHub.rules.action.${r.action}`)}</td>
                  <td className="py-2 px-3 text-xs break-words max-w-[220px]">{appsText(r)}</td>
                  <td className="py-2 px-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={r.enabled}
                      aria-label={t('tsHub.rules.toggle').replace('{name}', r.name)}
                      disabled={busyId === r._id}
                      onClick={() => void toggle(r)}
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50',
                        r.enabled ? 'bg-brand-500' : 'bg-gray-300'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                          r.enabled ? 'translate-x-5' : 'translate-x-0.5'
                        )}
                      />
                    </button>
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <button type="button" className={`${BUTTON_PLAIN} mr-2`} disabled={busyId === r._id} onClick={() => setEditing(r)}>
                      {t('tsHub.rules.edit')}
                    </button>
                    <button type="button" className={BUTTON_DANGER} disabled={busyId === r._id} onClick={() => setConfirmDelete(r)}>
                      {t('tsHub.rules.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!unavailable && (
        <div className="max-w-[720px]">
          <RuleTestPanel />
        </div>
      )}

      {editing && (
        <RuleDialog
          rule={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void load();
          }}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          title={t('tsHub.rules.deleteTitle').replace('{name}', confirmDelete.name)}
          message={t('tsHub.rules.deleteMessage')}
          confirmLabel={t('tsHub.rules.delete')}
          danger
          busy={busyId === confirmDelete._id}
          onConfirm={remove}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
