// One-step website assistant (start screen and the AI assistant tab of an App
// without one): create the App, create its agent, connect it to the App's
// widget, switch it on and give it knowledge (crawl a website or upload
// documents). Six calls from the browser; `progress` keeps what already
// exists so a retry after a failure resumes instead of creating twins.
// TODO(onboarding): one backend endpoint (review item 11).
import { actionCreateAgent, actionCreateApp, actionInviteAgentToChat, actionSetBotInstanceStatus } from '../actions';
import { httpAgentDocsUpload, httpAgentSiteCrawl, httpPrepareWidgetAgent, httpUpdateApp } from '../http';
import { ModelAgent, ModelApp } from '../models';
import { phCapture } from '../posthog';

export type WebsiteAssistantStage = 'creatingApp' | 'creatingAgent' | 'connecting' | 'addingWebsite' | 'uploadingDocs';

export interface WebsiteAssistantProgress {
  app?: ModelApp | null;
  agent?: ModelAgent | null;
  connected?: boolean;
}

export interface WebsiteAssistantInput {
  name: string;
  website?: string | null;
  files?: File[];
  existingApp?: ModelApp;
  prompt: string;
}

export class WebsiteAssistantError extends Error {
  // A create request lost its response: it may have succeeded, so the caller
  // should not retry blindly.
  uncertain: boolean;
  constructor(message: string, uncertain = false) {
    super(message);
    this.uncertain = uncertain;
  }
}

type AppWithDefault = ModelApp & { defaultBotInstanceId?: string };

export async function createWebsiteAssistant(
  input: WebsiteAssistantInput,
  progress: WebsiteAssistantProgress,
  onStage: (stage: WebsiteAssistantStage) => void
): Promise<{ app: ModelApp; agent: ModelAgent; jobId: string; crawlError?: string }> {
  let step: 'app' | 'agent' | 'other' = 'other';
  try {
    if (!progress.app) {
      progress.app = input.existingApp || null;
    }
    if (!progress.app) {
      step = 'app';
      onStage('creatingApp');
      progress.app = await actionCreateApp(input.name, { onboardingGoal: 'website' });
      if (!progress.app?._id) throw new WebsiteAssistantError('missingApp');
    }
    const app = progress.app as AppWithDefault;
    if (!progress.agent) {
      step = 'agent';
      onStage('creatingAgent');
      progress.agent = await actionCreateAgent({ displayName: input.name, ownerAppId: app._id, visibility: 'private', prompt: input.prompt });
      if (!progress.agent?.id) throw new WebsiteAssistantError('missingAgent');
    }
    step = 'other';
    const agent = progress.agent as ModelAgent;
    if (!progress.connected) {
      onStage('connecting');
      const chatId = app.aiBot?.chatId;
      const result = chatId
        ? await actionInviteAgentToChat(agent.id, { appId: app._id, chatId })
        : (await httpPrepareWidgetAgent(app._id, agent.id)).data;
      const instance = result?.botInstance || result?.respData?.botInstance;
      if (!instance?.id) throw new WebsiteAssistantError('missingConnection');
      const saved = await httpUpdateApp(app._id, { defaultBotInstanceId: instance.id, botStatus: 'on' });
      const savedApp = saved.data?.result;
      if (String(savedApp?.defaultBotInstanceId || '') !== String(instance.id) || savedApp?.aiBot?.status !== 'on') {
        throw new WebsiteAssistantError('activationUnconfirmed');
      }
      // App creation can invite the system Support Agent to the same room:
      // stop it so two bots do not answer visitors.
      const previousId = app.defaultBotInstanceId;
      if (previousId && previousId !== instance.id) {
        const stopped = await actionSetBotInstanceStatus(previousId, 'off');
        if (stopped?.status !== 'off') throw new WebsiteAssistantError('previousUnconfirmed');
      }
      progress.app = { ...app, ...savedApp };
      progress.connected = true;
    }
    let jobId = '';
    let crawlError: string | undefined;
    if (input.website) {
      onStage('addingWebsite');
      try {
        jobId = await startCrawl(app._id, agent.id, input.website);
      } catch (e) {
        // The assistant exists and is on: App Home shows why the website
        // could not be read, with Retry and Upload documents.
        crawlError = crawlErrorMessage(e);
        phCapture('onboarding_crawl_failed', { intent: 'website', reason: crawlError });
      }
    } else if (input.files?.length) {
      onStage('uploadingDocs');
      await httpAgentDocsUpload(app._id, agent.id, input.files);
      phCapture('onboarding_docs_uploaded', { intent: 'website', files: input.files.length });
    }
    phCapture('onboarding_project_created', { intent: 'website', has_website: Boolean(input.website), has_docs: Boolean(input.files?.length) });
    return { app: progress.app as ModelApp, agent, jobId, crawlError };
  } catch (e) {
    if (e instanceof WebsiteAssistantError) throw e;
    const err = e as { message?: string; response?: { data?: { error?: string } } };
    throw new WebsiteAssistantError(err.response?.data?.error || err.message || 'failed', step !== 'other' && !err.response);
  }
}

// Starts reading a website for the agent; '' when it is already indexed.
export async function startCrawl(appId: string, agentId: string, website: string): Promise<string> {
  try {
    const crawl = await httpAgentSiteCrawl(appId, agentId, website, true);
    const jobId = crawl.data?.jobId || '';
    if (jobId) phCapture('onboarding_crawl_started', { intent: 'website' });
    return jobId;
  } catch (e) {
    const code = (e as { response?: { data?: { code?: string } } }).response?.data?.code;
    // A retry after a lost response can find the page already indexed.
    if (code === 'SITE_SOURCE_ALREADY_INDEXED') return '';
    throw e;
  }
}

// The API's reason when it gives one (message, then code), else the
// transport error. Never empty.
export function crawlErrorMessage(e: unknown): string {
  const err = e as { message?: string; response?: { status?: number; data?: { error?: string; message?: string; code?: string; details?: { reason?: string } } } };
  const d = err.response?.data;
  const reason = d?.details?.reason || d?.message || d?.error || d?.code || err.message || 'unknown error';
  return err.response?.status ? `${reason} (HTTP ${err.response.status})` : reason;
}
