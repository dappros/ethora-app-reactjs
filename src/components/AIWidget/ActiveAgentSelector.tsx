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
import { useTranslation } from '../../i18n/useTranslation';
import { ModelAgent, ModelApp } from '../../models';
import { useAppStore } from '../../store/useAppStore';

interface ActiveAgentSelectorProps {
  appId: string;
  app?: ModelApp;
}

export const ActiveAgentSelector: React.FC<ActiveAgentSelectorProps> = ({ appId, app }) => {
  const { t } = useTranslation();
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

  // Always refresh agents + this App's BotInstances when the selector mounts
  // or when appId changes. The previous lazy-load ("only if store empty")
  // produced a confusing "— None —" state on freshly-created Apps: the App
  // record correctly carried defaultBotInstanceId pointing at the auto-
  // attached Support Agent, but the BotInstance for the NEW app wasn't in
  // the store yet (it still held the previous App's instances) and the
  // agents store might have been seeded earlier with a "mine only" call
  // that excluded the public Support Agent — so the currentAgent useMemo
  // resolved to null, and the dropdown defaulted to "— None —" until a
  // full page reload triggered a fresh fetch. Eager-refetching here is
  // cheap (both endpoints return small lean payloads) and removes the
  // "first-paint after navigation" stale-data window entirely.
  //
  // No visibility filter on agents: the backend defaults to "own + public",
  // so the platform-level Support Agent (ownerId='system', visibility='public')
  // is included.
  useEffect(() => {
    actionListAgents({}).catch(() => {});
    if (appId) {
      actionListBotInstances({ appId }).catch(() => {});
    }
  }, [appId]);

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
        toast.success(t('aiWidgetActiveAgentSelector.clearedToast'));
      } finally {
        setBusy(false);
      }
      return;
    }
    const widgetChatId = app?.aiBot?.chatId;
    if (!widgetChatId) {
      toast.warn(t('aiWidgetActiveAgentSelector.bindChatWarn'));
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
        toast.success(
          t('aiWidgetActiveAgentSelector.defaultAgentSetToast').replace(
            '{name}',
            newAgentLabel
          )
        );
        await actionListBotInstances({ appId });
      }
    } catch (e: any) {
      toast.error(
        `${t('aiWidgetActiveAgentSelector.failedPrefix')} ${e?.response?.data?.error || e.message}`
      );
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
      <span className="text-gray-600">{t('aiWidgetActiveAgentSelector.label')}</span>
      <select
        className="border rounded px-2 py-1 text-sm bg-white disabled:bg-gray-100 disabled:cursor-wait"
        value={currentAgent?.id || ''}
        disabled={busy}
        onChange={(e) => pick(e.target.value)}
      >
        {/* "None" lets an operator deliberately unbind the widget (default
            assistant is already attached on App creation; this is the
            opt-out). The legacy "aiBot" path is gone as of Phase B.5. */}
        <option value="">{t('aiWidgetActiveAgentSelector.none')}</option>
        {myAgents.length > 0 && (
          <optgroup label={t('aiWidgetActiveAgentSelector.myAgents')}>
            {myAgents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.displayName}
              </option>
            ))}
          </optgroup>
        )}
        {publicAgents.length > 0 && (
          <optgroup label={t('aiWidgetActiveAgentSelector.publicAgents')}>
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
          <span>{t('aiWidgetActiveAgentSelector.binding')}</span>
        </span>
      )}
      <span className="text-gray-400">|</span>
      {/* Phase 1 follow-up: Agents now live at the tenant-scope /app/admin/agents page.
          One Agent can be deployed across many Apps; the dropdown above just picks which
          Agent backs THIS App's AI Widget. */}
      <Link to="/app/admin/agents" className="text-brand-500 hover:underline">
        {t('aiWidgetActiveAgentSelector.manageAgents')}
      </Link>
    </div>
  );
};
