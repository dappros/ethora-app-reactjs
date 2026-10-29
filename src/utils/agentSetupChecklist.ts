const PREFIX = 'agentSetup-538';
export const AGENT_SETUP_CHANGE_EVENT = 'agent-setup-changed';

function read(key: string): boolean {
  try {
    return localStorage.getItem(`${PREFIX}:${key}`) === 'true';
  } catch {
    return false;
  }
}

function write(key: string) {
  try {
    localStorage.setItem(`${PREFIX}:${key}`, 'true');
  } catch {
  }
  window.dispatchEvent(new Event(AGENT_SETUP_CHANGE_EVENT));
}

export const markAgentTried = (agentId: string) => write(`tried:${agentId}`);
export const isAgentTried = (agentId: string) => read(`tried:${agentId}`);

export const markWidgetCodeCopied = (appId: string) => write(`copied:${appId}`);
export const isWidgetCodeCopied = (appId: string) => read(`copied:${appId}`);

export const dismissAgentSetup = (agentId: string) => write(`dismissed:${agentId}`);
export const isAgentSetupDismissed = (agentId: string) => read(`dismissed:${agentId}`);
