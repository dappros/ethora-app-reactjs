import { useMemo } from 'react';
import { ModelAgent, ModelApp } from '../models';
import { useAppStore } from '../store/useAppStore';

// The Agent answering this App's website widget: App.defaultBotInstanceId ->
// BotInstance.agentId -> Agent. Prefers `currentApp` from the store when it is
// the same App, because ActiveAgentSelector pushes the updated App row there
// after a switch while the page's own `app` prop stays as it was at mount.
export function useActiveWidgetAgent(app?: ModelApp): ModelAgent | null {
  const currentApp = useAppStore((s) => s.currentApp);
  const agents = useAppStore((s) => s.agents);
  const botInstances = useAppStore((s) => s.botInstances);
  return useMemo(() => {
    const cur = currentApp as unknown as { _id?: string; defaultBotInstanceId?: string } | null;
    const own = app as unknown as { _id?: string; defaultBotInstanceId?: string } | undefined;
    const sameApp = cur?._id && own?._id && String(cur._id) === String(own._id);
    const biId = sameApp ? cur?.defaultBotInstanceId : own?.defaultBotInstanceId || cur?.defaultBotInstanceId;
    if (!biId) return null;
    const bi = botInstances.find((b) => b.id === biId);
    if (!bi) return null;
    return agents.find((a) => a.id === bi.agentId) || null;
  }, [agents, botInstances, app, currentApp]);
}
