// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Phase 1 (Agents): "Active Agent" selector banner on the legacy AI Widget page. Lists
// every Agent owned by this App + a quick link to the AI Bots tab. Choosing one writes
// `App.defaultBotInstanceId` (creating a BotInstance lazily by inviting the agent into
// the AI Widget chat if needed). The legacy "Code" / "Prompt" / "Add websites" /
// "Add documents" tabs underneath are intentionally preserved for back-compat - they
// continue to read/write `App.aiBot.*` and the v2/bot controller fans the changes
// out to the linked Agent.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import { actionInviteAgentToChat, actionListAgents, actionListBotInstances } from '../../actions';
import { httpPrepareWidgetAgent, httpUpdateApp } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelApp } from '../../models';
import { useAppStore } from '../../store/useAppStore';
import { useActiveWidgetAgent } from '../../hooks/useActiveWidgetAgent';

interface ActiveAgentSelectorProps {
  appId: string;
  app?: ModelApp;
  // Inside the AI agent card: just the picker, no box or Manage agents link.
  bare?: boolean;
  disabled?: boolean;
  label?: string;
}

export const ActiveAgentSelector: React.FC<ActiveAgentSelectorProps> = ({ appId, app, bare = false, disabled = false, label }) => {
  const { t } = useTranslation();
  const agents = useAppStore((s) => s.agents);
  const doUpdateApp = useAppStore((s) => s.doUpdateApp);
  const [busy, setBusy] = useState(false);
  const currentAgent = useActiveWidgetAgent(app);

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
        pushAppToStore(r?.data?.result);
        toast.success(t('aiWidgetActiveAgentSelector.clearedToast'));
      } finally {
        setBusy(false);
      }
      return;
    }
    const widgetChatId = app?.aiBot?.chatId;
    setBusy(true);
    try {
      const out = widgetChatId
        ? await actionInviteAgentToChat(agentId, { appId, chatId: widgetChatId })
        : (await httpPrepareWidgetAgent(appId, agentId)).data;
      const bi = (out as any)?.botInstance || (out as any)?.respData?.botInstance;
      if (bi?.id) {
        const r = await httpUpdateApp(appId, { defaultBotInstanceId: bi.id });
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
    <div className={bare ? 'flex flex-wrap items-center gap-2 text-sm' : 'border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 mb-2 flex items-center gap-2 text-sm'}>
      <label htmlFor={`active-agent-${appId}`} className="shrink-0 font-medium text-gray-700">{label || t('aiWidgetActiveAgentSelector.label')}</label>
      <span className="relative inline-flex w-44 max-w-full shrink-0 sm:w-48">
        <select
          id={`active-agent-${appId}`}
          className="active-agent-select h-10 w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 disabled:cursor-wait disabled:bg-gray-100"
          value={currentAgent?.id || ''}
          disabled={busy || disabled}
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
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700">
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
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
      {!bare && <span className="text-gray-400">|</span>}
      {/* Phase 1 follow-up: Agents now live at the tenant-scope /app/admin/agents page.
          One Agent can be deployed across many Apps; the dropdown above just picks which
          Agent backs THIS App's AI Widget. */}
      {!bare && (
        <Link to="/app/admin/agents" className="text-brand-500 hover:underline">
          {t('aiWidgetActiveAgentSelector.manageAgents')}
        </Link>
      )}
    </div>
  );
};
