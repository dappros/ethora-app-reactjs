import Clarity from '@microsoft/clarity';

let started = false;
let pendingIdentify: (() => void) | null = null;

export function initializeClarity(clarityId: string) {
  if (started) return;
  try {
    Clarity.init(clarityId);
    started = true;
  } catch (error) {
    console.error('Microsoft Clarity failed to start', error);
    return;
  }
  const run = pendingIdentify;
  pendingIdentify = null;
  run?.();
}

export function clarityIdentify(userId: string, appId?: string) {
  const run = () => {
    try {
      Clarity.identify(userId);
      if (appId) Clarity.setTag('appId', appId);
    } catch (error) {
      console.warn('[clarity] identify failed', error);
    }
  };
  if (started) run();
  else pendingIdentify = run;
}
