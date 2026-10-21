// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// "Generate with AI" for the Flows tab. The operator describes the conversation,
// chooses to replace the editor's script or to extend it, and gets back a script
// the API has already compiled (POST /v2/agents/flows/generate retries the model
// with the compiler's errors and never returns invalid YAML). Before anything
// touches the editor the dialog shows what would change: a line diff, the map of
// the result, the raw script, and the generator's warnings. "Apply" only fills
// the editor; saving stays an explicit step in the panel.

import { Dialog, DialogPanel } from '@headlessui/react';
import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlowsGenerateResult, FlowsValidationError, httpGenerateAgentFlows } from '../../../../http';
import { useTranslation } from '../../../../i18n/useTranslation';
import { collapseDiff, diffLines, diffStats } from '../../../../lib/flows/flowDiff';
import { IconClose } from '../../../Icons/IconClose';
import { FlowMapView } from './FlowMapView';

type Mode = 'extend' | 'replace';
type View = 'changes' | 'map' | 'yaml';

// Sent to the model as the language of the visitor-facing text. Empty = the
// language the description is written in.
const LANGUAGES = ['', 'English', 'French', 'Spanish', 'German', 'Italian', 'Portuguese', 'Ukrainian', 'Polish', 'Dutch'];

export const FlowGenerateDialog: React.FC<{
  agentId: string;
  // The editor's script now. Empty: nothing to extend.
  currentYaml: string;
  onApply: (yaml: string) => void;
  onClose: () => void;
}> = ({ agentId, currentYaml, onApply, onClose }) => {
  const { t } = useTranslation();
  const hasCurrent = currentYaml.trim().length > 0;
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<Mode>(hasCurrent ? 'extend' : 'replace');
  const [language, setLanguage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; details: FlowsValidationError[] } | null>(null);
  // The script the result was generated against, so the diff is against what was sent.
  const [result, setResult] = useState<{ data: FlowsGenerateResult; base: string; mode: Mode } | null>(null);
  const [view, setView] = useState<View>('changes');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const canGenerate = description.trim().length >= 3 && !busy;

  const generate = async () => {
    if (!canGenerate) return;
    const ctl = new AbortController();
    abortRef.current = ctl;
    setBusy(true);
    setError(null);
    try {
      const sendCurrent = mode === 'extend' && hasCurrent;
      const r = await httpGenerateAgentFlows(
        {
          description: description.trim(),
          agentId,
          ...(sendCurrent ? { currentYaml } : {}),
          ...(language ? { language } : {}),
        },
        ctl.signal
      );
      setResult({ data: r.data, base: currentYaml, mode: sendCurrent ? 'extend' : 'replace' });
      setView('changes');
    } catch (e) {
      if (ctl.signal.aborted) return;
      const err = e as { response?: { status?: number; data?: { error?: string; code?: string; details?: FlowsValidationError[] } }; message?: string };
      const code = err.response?.data?.code;
      const message =
        code === 'FLOWS_GENERATION_INVALID'
          ? t('agentPanels.flowsGenInvalid')
          : code === 'AI_AGENTS_DISABLED' || code === 'LICENSE_FEATURE_NOT_INCLUDED'
          ? t('agentPanels.flowsGenDisabled')
          : err.response?.status === 429
          ? t('agentPanels.flowsGenRateLimited')
          : code === 'AI_SERVICE_ERROR' || (err as { code?: string }).code === 'ECONNABORTED'
          ? t('agentPanels.flowsGenProviderBusy')
          : code === 'AI_SERVICE_UNAVAILABLE'
          ? t('agentPanels.flowsGenUnavailable')
          : `${t('agentPanels.flowsGenFailed')} ${err.response?.data?.error || err.message || ''}`;
      setError({ message, details: Array.isArray(err.response?.data?.details) ? (err.response?.data?.details as FlowsValidationError[]) : [] });
    } finally {
      if (abortRef.current === ctl) setBusy(false);
    }
  };

  const diff = useMemo(() => (result ? diffLines(result.base, result.data.flowsYaml) : []), [result]);
  const stats = useMemo(() => diffStats(diff), [diff]);
  const rows = useMemo(() => collapseDiff(diff, 2), [diff]);

  const close = () => {
    abortRef.current?.abort();
    onClose();
  };

  return (
    <Dialog open onClose={close} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel data-testid="flows-generate-dialog" className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded bg-white shadow-lg">
          <div className="flex items-start gap-2 border-b p-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{t('agentPanels.flowsGenTitle')}</div>
              <div className="mt-0.5 text-xs text-gray-500">{t('agentPanels.flowsGenSubtitle')}</div>
            </div>
            <button type="button" onClick={close} aria-label={t('agentPanels.closeDialog')} className="p-1">
              <IconClose />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-auto p-3">
            {!result && (
              <>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600">{t('agentPanels.flowsGenDescription')}</span>
                  <textarea
                    data-testid="flows-generate-description"
                    className="w-full rounded border bg-white px-2 py-2 text-sm"
                    rows={5}
                    maxLength={4000}
                    autoFocus
                    disabled={busy}
                    value={description}
                    placeholder={t('agentPanels.flowsGenPlaceholder')}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>

                <fieldset className="space-y-1" disabled={busy}>
                  <legend className="mb-1 text-xs font-semibold text-gray-600">{t('agentPanels.flowsGenModeLabel')}</legend>
                  <label className={classNames('flex items-start gap-2 text-sm', !hasCurrent && 'opacity-50')}>
                    <input type="radio" name="flows-gen-mode" checked={mode === 'extend'} disabled={!hasCurrent} onChange={() => setMode('extend')} />
                    <span>
                      {t('agentPanels.flowsGenModeExtend')}
                      <span className="block text-xs text-gray-500">{t('agentPanels.flowsGenModeExtendHint')}</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-2 text-sm">
                    <input type="radio" name="flows-gen-mode" checked={mode === 'replace'} onChange={() => setMode('replace')} />
                    <span>
                      {t('agentPanels.flowsGenModeReplace')}
                      <span className="block text-xs text-gray-500">{t('agentPanels.flowsGenModeReplaceHint')}</span>
                    </span>
                  </label>
                </fieldset>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600">{t('agentPanels.flowsGenLanguage')}</span>
                  <select className="rounded border bg-white px-2 py-1 text-sm" value={language} disabled={busy} onChange={(e) => setLanguage(e.target.value)}>
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l || t('agentPanels.flowsGenLanguageAuto')}
                      </option>
                    ))}
                  </select>
                </label>

                {busy && (
                  <p data-testid="flows-generate-busy" className="text-sm text-gray-500">
                    {t('agentPanels.flowsGenBusy')}
                  </p>
                )}
                {error && (
                  <div data-testid="flows-generate-error" className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                    <div className="font-semibold">{error.message}</div>
                    {error.details.length > 0 && (
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 font-mono">
                        {error.details.slice(0, 8).map((d, i) => (
                          <li key={i}>
                            {d.line ? `${t('agentPanels.flowsLine').replace('{line}', String(d.line))} ` : ''}
                            {d.path ? `${d.path} ` : ''}
                            {d.message}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </>
            )}

            {result && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div data-testid="flows-generate-summary" className="text-sm">
                    {t('agentPanels.flowsGenResult').replace('{keys}', result.data.flowKeys.join(', '))}
                    <span className="ml-2 text-xs text-gray-500">
                      {t('agentPanels.flowsGenStats').replace('{added}', String(stats.added)).replace('{removed}', String(stats.removed))}
                    </span>
                  </div>
                  <div role="group" aria-label={t('agentPanels.flowsGenViews')} className="flex overflow-hidden rounded border text-xs">
                    {(['changes', 'map', 'yaml'] as View[]).map((v) => (
                      <button
                        key={v}
                        type="button"
                        aria-pressed={view === v}
                        data-testid={`flows-generate-view-${v}`}
                        onClick={() => setView(v)}
                        className={classNames('px-3 py-1', view === v ? 'bg-brand-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-200')}
                      >
                        {t(`agentPanels.flowsGenView_${v}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {result.data.warnings.length > 0 && (
                  <div data-testid="flows-generate-warnings" className="rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                    <div className="mb-1 font-semibold">{t('agentPanels.flowsMapWarnings')}</div>
                    <ul className="list-disc space-y-0.5 pl-4">
                      {result.data.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {view === 'changes' && (
                  <div data-testid="flows-generate-diff" className="overflow-auto rounded border font-mono text-xs leading-5" style={{ maxHeight: '45vh' }}>
                    {rows.length === 0 && <div className="p-3 text-gray-500">{t('agentPanels.flowsGenNoChanges')}</div>}
                    {rows.map((r, i) =>
                      r.type === 'skip' ? (
                        <div key={i} className="bg-gray-50 px-3 text-gray-400 dark:text-gray-500">
                          {t('agentPanels.flowsGenUnchanged').replace('{n}', String(r.count))}
                        </div>
                      ) : (
                        <div
                          key={i}
                          data-diff={r.type}
                          className={classNames(
                            'whitespace-pre px-3',
                            r.type === 'add' && 'bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-200',
                            r.type === 'del' && 'bg-red-50 text-red-900 dark:bg-red-950/30 dark:text-red-200'
                          )}
                        >
                          {r.type === 'add' ? '+ ' : r.type === 'del' ? '- ' : '  '}
                          {r.text}
                        </div>
                      )
                    )}
                  </div>
                )}
                {view === 'map' && <FlowMapView map={result.data.map || null} />}
                {view === 'yaml' && (
                  <pre data-testid="flows-generate-yaml" className="overflow-auto rounded border p-3 font-mono text-xs" style={{ maxHeight: '45vh' }}>
                    {result.data.flowsYaml}
                  </pre>
                )}
                <p className="text-xs text-gray-500">{t('agentPanels.flowsGenNotSaved')}</p>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t p-3">
            {!result ? (
              <>
                <button type="button" onClick={close} className="rounded border px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-200">
                  {t('agentPanels.flowsGenCancel')}
                </button>
                <button
                  type="button"
                  data-testid="flows-generate-submit"
                  onClick={generate}
                  disabled={!canGenerate}
                  className="rounded bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400 disabled:opacity-50"
                >
                  {busy ? t('agentPanels.flowsGenWriting') : t('agentPanels.flowsGenSubmit')}
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setResult(null)} className="rounded border px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-200">
                  {t('agentPanels.flowsGenBack')}
                </button>
                <button type="button" onClick={close} className="rounded border px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-200">
                  {t('agentPanels.flowsGenDiscard')}
                </button>
                <button
                  type="button"
                  data-testid="flows-generate-apply"
                  onClick={() => onApply(result.data.flowsYaml)}
                  className="rounded bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400"
                >
                  {result.mode === 'extend' ? t('agentPanels.flowsGenApplyExtend') : t('agentPanels.flowsGenApplyReplace')}
                </button>
              </>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
