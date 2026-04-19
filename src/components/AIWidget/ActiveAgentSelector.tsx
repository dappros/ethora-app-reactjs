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
  const [busy, setBusy] = useState(false);
  const [defaultBotInstanceId, setDefaultBotInstanceId] = useState<string | null>(
    (app as any)?.defaultBotInstanceId || null
  );

  useEffect(() => {
    setDefaultBotInstanceId((app as any)?.defaultBotInstanceId || null);
  }, [app]);

  // Lazy-load only if the store is empty; the AI Bots tab will populate when opened.
  useEffect(() => {
    if (!agents.length) {
      actionListAgents({ visibility: 'mine' }).catch(() => {});
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

  async function pick(agentId: string) {
    if (!agentId) {
      // Clear pointer.
      setBusy(true);
      try {
        await httpUpdateApp(appId, { defaultBotInstanceId: '' });
        setDefaultBotInstanceId(null);
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
        await httpUpdateApp(appId, { defaultBotInstanceId: bi.id });
        setDefaultBotInstanceId(bi.id);
        toast.success(`Default agent set to "${currentAgent?.displayName || bi.xmppUsername}"`);
        await actionListBotInstances({ appId });
      }
    } catch (e: any) {
      toast.error(`Failed: ${e?.response?.data?.error || e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 mb-2 flex items-center gap-2 text-sm">
      <span className="text-gray-600">Active agent for AI Widget:</span>
      <select
        className="border rounded px-2 py-1 text-sm bg-white"
        value={currentAgent?.id || ''}
        disabled={busy}
        onChange={(e) => pick(e.target.value)}
      >
        <option value="">(legacy aiBot - no agent)</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>
            {a.displayName} {a.visibility === 'public' ? '(public)' : ''}
          </option>
        ))}
      </select>
      <span className="text-gray-400">|</span>
      <Link to={`?tab=AI+Bots`} className="text-brand-500 hover:underline">
        Manage agents in AI Bots tab
      </Link>
    </div>
  );
};
