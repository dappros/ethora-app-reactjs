// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// "Try flow": a chat-like panel that plays the flows script in the editor (saved
// or not) deterministically, with no AI. Every turn is POST /v2/agents/flows/
// simulate, which runs the real flow engine on ai-service, so buttons, trigger
// phrases, answer checks, retries, "skip", "cancel" and `when` behave exactly
// as in a live chat. Where the live agent would answer with the model, the
// transcript shows a placeholder bubble. Nothing is stored.
//
// A conversation is bound to the script it started with: editing the script
// while chatting does not change the running conversation (a banner offers a
// restart), because the engine's run state belongs to one version of the script.

import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlowSimButton, FlowSimResult, FlowSimState, httpSimulateAgentFlows } from '../../../../http';
import { useTranslation } from '../../../../i18n/useTranslation';

type Entry =
  | { id: number; from: 'visitor'; text: string }
  | { id: number; from: 'bot'; text: string; buttons: FlowSimButton[] }
  | { id: number; from: 'llm'; reason: 'free' | 'aside' | 'handoff'; label?: string }
  | { id: number; from: 'note'; text: string; error?: boolean };

export type FlowOption = { key: string; description: string };

export const FlowSimulator: React.FC<{
  yaml: string;
  // The script has errors (or is still being checked): trying it is pointless.
  blocked: boolean;
  // Flows the agent could start by itself (everything except `start`).
  flowOptions: FlowOption[];
}> = ({ yaml, blocked, flowOptions }) => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [state, setState] = useState<FlowSimState | null>(null);
  const [ended, setEnded] = useState(false);
  const [buttons, setButtons] = useState<FlowSimButton[]>([]);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const idRef = useRef(0);
  // Bumped by every restart; answers of an older conversation are dropped.
  const sessionRef = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);

  const empty = !yaml.trim();
  const stale = snapshot !== null && snapshot !== yaml;

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [entries.length, busy]);

  const nextId = useCallback(() => ++idRef.current, []);

  const apply = useCallback(
    (r: FlowSimResult, opts: { opening?: boolean } = {}) => {
      const added: Entry[] = r.messages.map((m) =>
        m.kind === 'bot'
          ? { id: nextId(), from: 'bot', text: m.text, buttons: m.buttons }
          : { id: nextId(), from: 'llm', reason: m.reason, label: m.label }
      );
      if (opts.opening && added.length === 0) added.push({ id: nextId(), from: 'note', text: t('agentPanels.flowsTryNoStart') });
      if (r.ended && r.outcome !== 'noop' && !opts.opening) added.push({ id: nextId(), from: 'note', text: t('agentPanels.flowsTryEnded') });
      setEntries((prev) => [...prev, ...added]);
      setState(r.state);
      setEnded(r.ended);
      setButtons(r.buttons);
    },
    [t, nextId]
  );

  const fail = useCallback(
    (e: unknown) => {
      const err = e as { response?: { data?: { error?: string; code?: string } }; message?: string };
      const message =
        err.response?.data?.code === 'AI_SERVICE_UNAVAILABLE' || err.response?.data?.code === 'AI_SERVICE_ERROR'
          ? t('agentPanels.flowsTryUnavailable')
          : `${t('agentPanels.flowsTryFailed')} ${err.response?.data?.error || err.message || ''}`;
      const id = nextId();
      setEntries((prev) => [...prev, { id, from: 'note', text: message, error: true }]);
    },
    [t, nextId]
  );

  // Begin a conversation with the current script: the opening (`start` flow),
  // or straight into a flow the agent would start by intent.
  const begin = useCallback(
    async (startFlow?: string) => {
      const session = ++sessionRef.current;
      setEntries([]);
      setState(null);
      setEnded(false);
      setButtons([]);
      setSnapshot(yaml);
      setBusy(true);
      try {
        const r = await httpSimulateAgentFlows({ flowsYaml: yaml, ...(startFlow ? { startFlow } : {}) });
        if (session !== sessionRef.current) return;
        if (startFlow) {
          setEntries([{ id: nextId(), from: 'note', text: t('agentPanels.flowsTryStartedBy').replace('{flow}', startFlow) }]);
        }
        apply(r.data, { opening: !startFlow });
      } catch (e) {
        if (session !== sessionRef.current) return;
        fail(e);
      } finally {
        if (session === sessionRef.current) setBusy(false);
      }
    },
    [yaml, apply, fail, t, nextId]
  );

  // Open the conversation the first time the panel has a script that can run.
  useEffect(() => {
    if (snapshot === null && !blocked && !empty) void begin();
  }, [snapshot, blocked, empty, begin]);

  const send = async (value: string, shown?: string) => {
    const msg = value.trim();
    if (!msg || busy || snapshot === null) return;
    const session = sessionRef.current;
    const id = nextId();
    setEntries((prev) => [...prev, { id, from: 'visitor', text: shown ?? msg }]);
    setText('');
    setButtons([]);
    setBusy(true);
    try {
      const r = await httpSimulateAgentFlows({ flowsYaml: snapshot, state, input: msg });
      if (session !== sessionRef.current) return;
      apply(r.data);
    } catch (e) {
      if (session !== sessionRef.current) return;
      fail(e);
    } finally {
      if (session === sessionRef.current) setBusy(false);
    }
  };

  if (empty) {
    return (
      <div data-testid="flows-try-empty" className="rounded border border-dashed p-6 text-sm text-gray-500">
        {t('agentPanels.flowsTryEmpty')}
      </div>
    );
  }

  const lastBotId = [...entries].reverse().find((e) => e.from === 'bot')?.id;
  const slots = state ? Object.entries(state.slots) : [];

  return (
    <div className="space-y-3" data-testid="flows-try">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm text-gray-600">{t('agentPanels.flowsTryIntro')}</p>
        <div className="flex items-center gap-2">
          {flowOptions.length > 0 && (
            <select
              aria-label={t('agentPanels.flowsTryStartFlow')}
              data-testid="flows-try-startflow"
              className="rounded border bg-white px-2 py-1 text-xs"
              value=""
              disabled={busy || blocked}
              onChange={(e) => {
                if (e.target.value) void begin(e.target.value);
              }}
            >
              <option value="">{t('agentPanels.flowsTryStartFlow')}</option>
              {flowOptions.map((f) => (
                <option key={f.key} value={f.key} title={f.description}>
                  {f.key}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            data-testid="flows-try-restart"
            onClick={() => void begin()}
            disabled={busy || blocked}
            className="whitespace-nowrap text-xs text-brand-500 hover:underline disabled:opacity-50"
          >
            {t('agentPanels.flowsTryRestart')}
          </button>
        </div>
      </div>

      {stale && (
        <div data-testid="flows-try-stale" className="flex flex-wrap items-center gap-2 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <span>{t('agentPanels.flowsTryStale')}</span>
          <button type="button" className="font-semibold underline hover:no-underline disabled:opacity-50" disabled={busy || blocked} onClick={() => void begin()}>
            {t('agentPanels.flowsTryRestart')}
          </button>
        </div>
      )}
      {blocked && (
        <div data-testid="flows-try-blocked" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {t('agentPanels.flowsTryBlocked')}
        </div>
      )}

      <div className="max-h-[55vh] min-h-[260px] space-y-3 overflow-y-auto rounded-xl border bg-gray-50 p-3" data-testid="flows-try-transcript">
        {entries.map((e) => {
          if (e.from === 'visitor') {
            return (
              <div key={e.id} className="flex justify-end">
                <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-brand-500 px-3 py-2 text-sm text-white">{e.text}</div>
              </div>
            );
          }
          if (e.from === 'bot') {
            const live = e.id === lastBotId && !ended && buttons.length > 0 && !stale;
            return (
              <div key={e.id} className="flex justify-start">
                <div className="max-w-[80%] space-y-2">
                  <div className="whitespace-pre-wrap rounded-2xl rounded-bl-sm border bg-white px-3 py-2 text-sm">{e.text}</div>
                  {e.buttons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {e.buttons.map((b) => (
                        <button
                          key={b.value}
                          type="button"
                          disabled={!live || busy}
                          onClick={() => void send(b.value, b.label)}
                          className="rounded-full border border-brand-500 px-3 py-1 text-xs text-brand-500 hover:bg-brand-500 hover:text-white disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-brand-500"
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }
          if (e.from === 'llm') {
            return (
              <div key={e.id} className="flex justify-start" data-testid="flows-try-llm">
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-dashed border-gray-400 px-3 py-2 text-sm italic text-gray-500">
                  {t('agentPanels.flowsTryAgentAnswers')}
                  {e.reason === 'aside' && <span className="mt-1 block not-italic text-[11px]">{t('agentPanels.flowsTryAside')}</span>}
                  {e.reason === 'handoff' && (
                    <span className="mt-1 block not-italic text-[11px]">{t('agentPanels.flowsTryHandoff').replace('{label}', e.label || '')}</span>
                  )}
                </div>
              </div>
            );
          }
          return (
            <div key={e.id} className={classNames('text-center text-[11px]', e.error ? 'text-red-700 dark:text-red-300' : 'text-gray-500')}>
              {e.text}
            </div>
          );
        })}
        {busy && <div className="text-sm text-gray-400 dark:text-gray-500">{t('agentPanels.flowsTryThinking')}</div>}
        <div ref={endRef} />
      </div>

      {slots.length > 0 && (
        <div data-testid="flows-try-slots" className="rounded border bg-white px-3 py-2 text-xs">
          <span className="font-semibold">{t('agentPanels.flowsTrySlots')}</span>{' '}
          {slots.map(([k, v], i) => (
            <span key={k} className="font-mono">
              {i > 0 ? ', ' : ''}
              {k}={JSON.stringify(v)}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <textarea
          className="flex-1 rounded border bg-white px-2 py-2 text-sm"
          rows={2}
          data-testid="flows-try-input"
          value={text}
          disabled={blocked || snapshot === null}
          placeholder={t('agentPanels.flowsTryPlaceholder')}
          aria-label={t('agentPanels.flowsTryPlaceholder')}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send(text);
            }
          }}
        />
        <button
          type="button"
          data-testid="flows-try-send"
          onClick={() => void send(text)}
          disabled={busy || blocked || snapshot === null || !text.trim()}
          className="self-end rounded bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400 disabled:opacity-50"
        >
          {t('agentPanels.trySend')}
        </button>
      </div>
      <p className="text-xs text-gray-500">{t('agentPanels.flowsTryNote')}</p>
    </div>
  );
};
