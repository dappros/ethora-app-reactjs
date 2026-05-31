// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Phase 1 (Agents): "Active Agent" selector banner on the legacy AI Widget page. Lists
// every Agent owned by this App + a quick link to the AI Bots tab. Choosing one writes
// `App.defaultBotInstanceId` (creating a BotInstance lazily by inviting the agent into
// the AI Widget chat if needed). The legacy "Code" / "Prompt" / "Add websites" /
// "Add documents" tabs underneath are intentionally preserved for back-compat - they
// continue to read/write `App.aiBot.*` and the v2/bot controller fans the changes
// out to the linked Agent.

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import { actionInviteAgentToChat, actionListAgents, actionListBotInstances } from '../../actions';
import { httpUpdateApp } from '../../http';
import { ModelAgent, ModelApp } from '../../models';
import { useAppStore } from '../../store/useAppStore';

interface ActiveAgentSelectorProps {
  appId: string;
  app?: ModelApp;
}

export const ActiveAgentSelector: React.FC<ActiveAgentSelectorProps> = ({ appId, app }) => {
  const agents = useAppStore((s) => s.agents);
  const botInstances = useAppStore((s) => s.botInstances);
  const doUpdateApp = useAppStore((s) => s.doUpdateApp);
  const [busy, setBusy] = useState(false);
  const [defaultBotInstanceId, setDefaultBotInstanceId] = useState<string | null>(
    (app as any)?.defaultBotInstanceId || null
  );

  useEffect(() => {
    setDefaultBotInstanceId((app as any)?.defaultBotInstanceId || null);
  }, [app]);

  // Lazy-load only if the store is empty; the AI Bots tab will populate when opened.
  // No visibility filter: the backend defaults to "own + public", which is what we
  // need so the platform-level Support Agent (ownerId='system', visibility='public')
  // also lands in `agents` and resolves as `currentAgent` when an App is bound to it
  // - without this the dropdown defaults to "(legacy aiBot - no agent)" on fresh Apps
  // even though defaultBotInstanceId is set.
  useEffect(() => {
    if (!agents.length) {
      actionListAgents({}).catch(() => {});
    }
    if (!botInstances.length && appId) {
      actionListBotInstances({ appId }).catch(() => {});
    }
  }, [agents.length, botInstances.length, appId]);

  const currentAgent: ModelAgent | null = useMemo(() => {
    if (!defaultBotInstanceId) return null;
    const bi = botInstances.find((b) => b.id === defaultBotInstanceId);
    if (!bi) return null;
    return agents.find((a) => a.id === bi.agentId) || null;
  }, [defaultBotInstanceId, botInstances, agents]);

  // After the API mutates the App row, mirror the new state into the
  // shared store so siblings reading `currentApp` (e.g. the persona
  // card under TabAIWidgetCode) re-render with the fresh
  // defaultBotInstanceId. Without this, the selector's own dropdown
  // updates (it has its own local state) but the persona card below
  // continues showing the previous Agent until the page is reloaded.
  function pushAppToStore(updated: any) {
    if (updated && updated._id) doUpdateApp(updated as any);
  }

  async function pick(agentId: string) {
    if (!agentId) {
      // Clear pointer.
      setBusy(true);
      try {
        const r = await httpUpdateApp(appId, { defaultBotInstanceId: '' });
        setDefaultBotInstanceId(null);
        pushAppToStore(r?.data?.result);
        toast.success('Cleared default agent');
      } finally {
        setBusy(false);
      }
      return;
    }
    const widgetChatId = app?.aiBot?.chatId;
    if (!widgetChatId) {
      toast.warn('Bind a chat to AI Widget first (Web App tab)');
      return;
    }
    setBusy(true);
    try {
      const out = await actionInviteAgentToChat(agentId, { appId, chatId: widgetChatId });
      const bi = (out as any)?.botInstance || (out as any)?.respData?.botInstance;
      if (bi?.id) {
        const r = await httpUpdateApp(appId, { defaultBotInstanceId: bi.id });
        setDefaultBotInstanceId(bi.id);
        pushAppToStore(r?.data?.result);
        // `currentAgent` is a useMemo that hasn't recomputed yet (the state
        // update we just dispatched flushes after this microtask), so it
        // still points at the previously-selected agent. Resolve the new
        // one from the agents store using the agentId we picked, falling
        // back to the bot's xmppUsername if the agent isn't loaded yet.
        const newAgent = agents.find((a) => a.id === agentId);
        const newAgentLabel = newAgent?.displayName || bi.xmppUsername;
        toast.success(`Default agent set to "${newAgentLabel}"`);
        await actionListBotInstances({ appId });
      }
    } catch (e: any) {
      toast.error(`Failed: ${e?.response?.data?.error || e.message}`);
    } finally {
      setBusy(false);
    }
  }

  // Split agents into "my tenant" vs "system / public" so the dropdown groups
  // tenant-owned personas separately from the platform-supplied ones (Support
  // Agent etc.). Falls back to a flat list when there's nothing in one bucket.
  const myAgents = agents.filter((a) => a.visibility !== 'public');
  const publicAgents = agents.filter((a) => a.visibility === 'public');

  return (
    <div className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 mb-2 flex items-center gap-2 text-sm">
      <span className="text-gray-600">Active agent for AI Widget:</span>
      <select
        className="border rounded px-2 py-1 text-sm bg-white disabled:bg-gray-100 disabled:cursor-wait"
        value={currentAgent?.id || ''}
        disabled={busy}
        onChange={(e) => pick(e.target.value)}
      >
        {/* "None" lets an operator deliberately unbind the widget (default
            assistant is already attached on App creation; this is the
            opt-out). The legacy "aiBot" path is gone as of Phase B.5. */}
        <option value="">— None —</option>
        {myAgents.length > 0 && (
          <optgroup label="My agents">
            {myAgents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.displayName}
              </option>
            ))}
          </optgroup>
        )}
        {publicAgents.length > 0 && (
          <optgroup label="System / Public agents">
            {publicAgents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.displayName}
              </option>
            ))}
          </optgroup>
        )}
      </select>
      {/* Spinner + status text while the bind is in flight. The full
          chain (invite-to-chat → updateApp → reload bot instances) takes
          ~10s on QA-class hardware, which is long enough that operators
          start clicking other things if there's no progress signal. */}
      {busy && (
        <span className="flex items-center gap-1 text-gray-500 text-xs">
          <CircularProgress size={12} />
          <span>Binding agent…</span>
        </span>
      )}
      <span className="text-gray-400">|</span>
      {/* Phase 1 follow-up: Agents now live at the tenant-scope /app/admin/agents page.
          One Agent can be deployed across many Apps; the dropdown above just picks which
          Agent backs THIS App's AI Widget. */}
      <Link to="/app/admin/agents" className="text-brand-500 hover:underline">
        Manage agents
      </Link>
    </div>
  );
};
