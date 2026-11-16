import { useEffect } from 'react';
import { actionListAgents, actionListBotInstances } from '../actions';
import { ModelApp } from '../models';
import { useAppStore } from '../store/useAppStore';
import { useActiveWidgetAgent } from './useActiveWidgetAgent';

// The App's AI assistant (the agent behind its website widget), loading the
// agents and BotInstances it is resolved from. `ownAgents` counts the agents
// this account owns: the agent picker only appears when there is a choice.
export function useAppAssistant(app?: ModelApp) {
  const appId = app?._id;
  const agents = useAppStore((s) => s.agents);
  const currentUserId = useAppStore((s) => (s.currentUser as { _id?: string } | null)?._id);
  useEffect(() => {
    if (!appId) return;
    actionListAgents({}).catch(() => {});
    actionListBotInstances({ appId }).catch(() => {});
  }, [appId]);
  const agent = useActiveWidgetAgent(app);
  const ownAgents = agents.filter((a) => currentUserId && String(a.ownerId) === String(currentUserId)).length;
  return { agent, ownAgents };
}
