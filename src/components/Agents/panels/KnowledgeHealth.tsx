import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AgentKnowledgeHealth, httpGetAgentKnowledge, httpRebuildAgentKnowledge } from '../../../http';
import { useTranslation } from '../../../i18n/useTranslation';

// Whether the agent can actually search what the Web Index / Docs Index lists.
// Pages are stored with their full text and embedded separately; when the
// embedding is missing (stored while the AI service was down, an index
// restored without them) the page is listed but never found. Rebuild
// re-embeds from the stored text: no re-crawl, no re-upload.
export const KnowledgeHealth: React.FC<{ agentId: string; refreshKey?: number | string }> = ({ agentId, refreshKey }) => {
  const { t } = useTranslation();
  const [health, setHealth] = useState<AgentKnowledgeHealth | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await httpGetAgentKnowledge(agentId);
      const d = r.data;
      // Anything without the counts (an older API, a proxy page) is ignored
      // rather than allowed to break the panel it sits in.
      setHealth(typeof d?.pages === 'number' && typeof d?.docs === 'number' && d.missing ? d : null);
    } catch {
      setHealth(null);
    }
  }, [agentId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (!health || health.pages + health.docs === 0) return null;

  const missing = health.missing.pages + health.missing.docs;
  const rebuild = async () => {
    setBusy(true);
    try {
      const r = await httpRebuildAgentKnowledge(agentId, true);
      toast.info(t('agentPanels.rebuildQueued').replace('{n}', String((r.data.pages || 0) + (r.data.docs || 0))));
      // Embedding runs in the background; look again once it has had a moment.
      window.setTimeout(load, 8000);
      window.setTimeout(load, 30000);
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      toast.error(`${t('agentPanels.failedPrefix')} ${err.response?.data?.error || err.message || ''}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="text-xs space-y-1" data-testid="knowledge-health">
      <div className="text-gray-600">
        {t('agentPanels.knowledgeSummary')
          .replace('{pages}', String(health.pages))
          .replace('{docs}', String(health.docs))
          .replace('{chunks}', health.chunks === null ? '?' : String(health.chunks))}
        {health.lastIndexedAt && (
          <> · {t('agentPanels.knowledgeLastIndexed').replace('{date}', health.lastIndexedAt.slice(0, 10))}</>
        )}
      </div>
      {!health.indexAvailable && <div className="text-gray-500">{t('agentPanels.knowledgeIndexUnavailable')}</div>}
      {health.indexAvailable && missing > 0 && (
        <div className="rounded border border-amber-200 bg-amber-50 p-2 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200 space-y-1">
          <div>
            {t('agentPanels.knowledgeMissing')
              .replace('{pages}', String(health.missing.pages))
              .replace('{docs}', String(health.missing.docs))}
          </div>
          {health.missing.examples.length > 0 && (
            <div className="font-mono break-all opacity-80">{health.missing.examples.join(', ')}</div>
          )}
          <button
            onClick={rebuild}
            disabled={busy}
            className="rounded bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 disabled:opacity-50"
          >
            {t('agentPanels.rebuildIndex')}
          </button>
        </div>
      )}
    </div>
  );
};
