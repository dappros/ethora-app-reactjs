import { useEffect, useRef, useState } from 'react';
import { AgentTryTurn, httpTryAgent } from '../../../http';
import { useTranslation } from '../../../i18n/useTranslation';
import { ModelAgent } from '../../../models';

type Turn = AgentTryTurn & { sources?: string[]; ragDocsUsed?: number; error?: boolean };

// The test history sent with each question. The API takes at most 20 turns.
const MAX_HISTORY = 20;

// A test chat with the agent, right in its settings: its instructions, memory
// and knowledge, without deploying it to an app first. Nothing is stored and
// the agent's memory is not changed. Scripted flows, buttons and reactions
// only run in real chats.
export const TryItPanel: React.FC<{ agent: ModelAgent }> = ({ agent }) => {
  const { t } = useTranslation();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [turns.length, busy]);

  const send = async () => {
    const question = text.trim();
    if (!question || busy) return;
    const history = turns
      .filter((turn) => !turn.error)
      .map(({ role, content }) => ({ role, content }))
      .slice(-MAX_HISTORY);
    setTurns((prev) => [...prev, { role: 'user', content: question }]);
    setText('');
    setBusy(true);
    try {
      const r = await httpTryAgent(agent.id, question, history);
      setTurns((prev) => [
        ...prev,
        { role: 'assistant', content: r.data.reply || '', sources: r.data.sources || [], ragDocsUsed: r.data.ragDocsUsed || 0 },
      ]);
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setTurns((prev) => [
        ...prev,
        { role: 'assistant', content: `${t('agentPanels.tryFailed')} ${err.response?.data?.error || err.message || ''}`, error: true },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 max-w-3xl">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-gray-600">{t('agentPanels.tryIntro')}</p>
        {turns.length > 0 && (
          <button onClick={() => setTurns([])} disabled={busy} className="text-xs text-brand-500 hover:underline whitespace-nowrap disabled:opacity-50">
            {t('agentPanels.tryNewConversation')}
          </button>
        )}
      </div>

      <div className="border rounded-xl p-3 min-h-[240px] max-h-[55vh] overflow-y-auto space-y-3 bg-gray-50 dark:bg-gray-900/30" data-testid="try-transcript">
        {turns.length === 0 && <div className="text-sm text-gray-400">{t('agentPanels.tryEmpty')}</div>}
        {turns.map((turn, i) => (
          <div key={i} className={turn.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={
                turn.role === 'user'
                  ? 'max-w-[80%] rounded-2xl rounded-br-sm bg-brand-500 text-white px-3 py-2 text-sm whitespace-pre-wrap'
                  : turn.error
                  ? 'max-w-[80%] rounded-2xl rounded-bl-sm bg-red-50 text-red-700 border border-red-200 px-3 py-2 text-sm'
                  : 'max-w-[80%] rounded-2xl rounded-bl-sm bg-white border px-3 py-2 text-sm whitespace-pre-wrap'
              }
            >
              {turn.content}
              {turn.role === 'assistant' && !turn.error && (turn.ragDocsUsed || 0) > 0 && (
                <div className="mt-2 pt-2 border-t text-[11px] text-gray-500 space-y-0.5">
                  <div>{t('agentPanels.tryUsedKnowledge').replace('{n}', String(turn.ragDocsUsed))}</div>
                  {(turn.sources || []).map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="block truncate text-brand-500 hover:underline">
                      {url}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="text-sm text-gray-400">{t('agentPanels.tryThinking')}</div>}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <textarea
          className="border rounded px-2 py-2 flex-1 text-sm"
          rows={2}
          value={text}
          placeholder={t('agentPanels.tryPlaceholder')}
          aria-label={t('agentPanels.tryPlaceholder')}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button
          onClick={send}
          disabled={busy || !text.trim()}
          className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2 text-sm disabled:opacity-50 self-end"
        >
          {t('agentPanels.trySend')}
        </button>
      </div>
    </div>
  );
};
