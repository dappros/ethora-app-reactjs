import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CopyButton } from '../components/CopyButton';
import { GoalIllustration } from '../components/GoalIllustration';
import { Secret } from '../components/Secret';
import { env } from '../config/env';
import { AgentKnowledgeHealth, httpGetAgentKnowledge, httpGetApp, httpGetSiteCrawlJob, httpUpdateApp } from '../http';
import { useAppAssistant } from '../hooks/useAppAssistant';
import { useAppRequests } from '../hooks/useAppRequests';
import { appGoal } from '../utils/appGoal';
import { countLabel } from '../utils/countLabel';
import { useTranslation } from '../i18n/useTranslation';
import { AppMilestoneKind, ModelApp } from '../models';
import { useAppStore } from '../store/useAppStore';
import { crawlErrorMessage, startCrawl } from '../utils/createWebsiteAssistant';

type Goal = NonNullable<ModelApp['onboardingGoal']>;
type Crawl = { status: string; savedPages?: number; error?: string | { message?: string } };

// App Home: the next step of the goal the owner picked at the start, from
// the server milestones (they survive a new browser or device), then the
// numbers once it is live.
export default function AppHome() {
  const { t } = useTranslation();
  const { appId } = useParams();
  const location = useLocation();
  const app = useAppStore((s) => s.apps.find((a) => a._id === appId));
  const doSetApp = useAppStore((s) => s.doSetApp);
  const { agent } = useAppAssistant(app);
  const requests = useAppRequests(appId);
  const [health, setHealth] = useState<AgentKnowledgeHealth | null>(null);
  const [crawl, setCrawl] = useState<Crawl | null>(null);
  const [jobId, setJobId] = useState<string>(location.state?.jobId || '');
  // A website the one-step setup could not start reading: the assistant is
  // kept, step 1 says why and offers Retry and Upload documents.
  const [crawlError, setCrawlError] = useState<string>(location.state?.crawlError || '');
  const [retrying, setRetrying] = useState(false);
  const website: string | null = location.state?.website || null;

  // Progress changes outside this page (a visitor, a crawl): fetch fresh on
  // every visit rather than trusting the copy AdminApp loaded.
  useEffect(() => {
    if (!appId) return;
    httpGetApp(appId).then((r) => doSetApp(r.data.result)).catch(() => {});
  }, [appId, doSetApp]);

  useEffect(() => {
    if (!agent?.id) return;
    httpGetAgentKnowledge(agent.id).then(({ data }) => setHealth(data)).catch(() => {});
  }, [agent?.id, crawl?.status]);

  // The crawl started by the one-step setup: show pages being read.
  useEffect(() => {
    if (!appId || !jobId) return;
    let cancelled = false;
    let timer: number | undefined;
    const poll = async () => {
      try {
        const { data } = await httpGetSiteCrawlJob(appId, jobId);
        if (cancelled) return;
        const job = data?.result as Crawl | undefined;
        if (!job) return;
        setCrawl(job);
        if (!['completed', 'failed', 'cancelled'].includes(job.status)) timer = window.setTimeout(poll, 3000);
        else {
          if (job.status === 'failed' || (job.status === 'completed' && !job.savedPages)) {
            const e = typeof job.error === 'string' ? job.error : job.error?.message;
            setCrawlError(e || (job.status === 'failed' ? 'the crawl failed' : 'no pages could be read'));
          }
          httpGetApp(appId).then((r) => doSetApp(r.data.result)).catch(() => {});
        }
      } catch {
        /* The checklist still shows the server state. */
      }
    };
    void poll();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [appId, jobId, doSetApp]);

  if (!app) return null;

  const m = app.milestones || {};
  const has = (k: AppMilestoneKind) => Boolean(m[k]?.firstAt);
  // Not inferred from the default agent: on an AI-enabled install every new
  // App gets the system Support Agent, whatever it is for.
  const goal: Goal | null = appGoal(app);
  const base = `/app/admin/apps/${app._id}`;

  const retryCrawl = async () => {
    if (!agent?.id || !website || retrying) return;
    setRetrying(true);
    try {
      const id = await startCrawl(app._id, agent.id, website);
      setCrawlError('');
      setCrawl(null);
      setJobId(id);
    } catch (e) {
      setCrawlError(crawlErrorMessage(e));
    } finally {
      setRetrying(false);
    }
  };

  if (!goal || goal === 'selfHost') {
    return <ChooseGoal app={app} onChosen={(next) => doSetApp({ ...app, onboardingGoal: next })} />;
  }

  if (goal === 'website') {
    const crawling = Boolean(crawl && !['completed', 'failed', 'cancelled'].includes(crawl.status));
    const pages = health?.pages ?? app.aiBot?.siteUrlsV2?.length ?? 0;
    const docs = health?.docs ?? app.aiBot?.files?.length ?? 0;
    const knows = has('knowledge_added') || pages + docs > 0;
    const failed = Boolean(crawlError) && !knows && !crawling;
    const host = (m.widget_installed?.meta?.host as string) || '';
    const testHost = (m.widget_test_page?.meta?.host as string) || '';
    const seen = has('widget_installed') || has('widget_test_page');
    const steps: StepDef[] = [
      {
        done: knows,
        title: knows ? t('appHome.web.knowsDone') : crawling ? t('appHome.web.crawling') : failed ? t('appHome.web.crawlFailed') : t('appHome.web.knows'),
        text: failed
          ? t('appHome.web.crawlFailedText').replace('{reason}', crawlError)
          : knows
          ? t('appHome.web.knowsDoneText').replace('{pages}', countLabel(t, 'pages', pages)).replace('{docs}', countLabel(t, 'docs', docs))
          : crawling
            ? t('appHome.web.crawlingText').replace('{pages}', String(crawl?.savedPages ?? 0))
            : t('appHome.web.knowsText'),
        action: failed ? undefined : { to: `${base}/assistant#knows`, label: knows ? t('appHome.manage') : t('appHome.web.addKnowledge') },
        body: failed ? (
          <div className="flex flex-wrap gap-2" data-testid="crawl-failed-actions">
            {website && (
              <button type="button" onClick={() => void retryCrawl()} disabled={retrying} className="min-h-9 rounded-lg bg-brand-500 px-3 text-sm font-semibold text-white hover:bg-brand-darker disabled:opacity-50">
                {retrying ? t('appHome.web.retrying') : t('appHome.web.retry')}
              </button>
            )}
            <Link to={`${base}/assistant#docs`} className="inline-flex min-h-9 items-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-800">
              {t('appAssistant.knows.uploadDocs')}
            </Link>
            <Link to={`${base}/assistant#knows`} className="inline-flex min-h-9 items-center px-1 text-sm text-brand-500 underline">
              {t('appHome.web.otherAddress')}
            </Link>
          </div>
        ) : undefined,
      },
      {
        done: has('agent_tested'),
        title: t('appHome.web.test'),
        text: t('appHome.web.testText'),
        action: { to: `${base}/assistant#test`, label: t('appHome.web.testAction') },
      },
      {
        // One rule: the widget seen on any page but this install's own.
        done: seen,
        // No host when the install was worked out from visitor conversations
        // that predate page capture (the API marks it meta.derived).
        title: has('widget_installed')
          ? host
            ? t('appHome.web.installedDone').replace('{host}', host)
            : t('appHome.web.installedDoneNoHost')
          : has('widget_test_page')
            ? t('appHome.web.testPage').replace('{host}', testHost)
            : t('appHome.web.install'),
        text: has('widget_installed') || !has('widget_test_page') ? t('appHome.web.installText') : t('appHome.web.testPageText'),
        action: { to: `${base}/assistant#install`, label: seen ? t('appHome.manage') : t('appHome.web.installAction') },
      },
      {
        done: has('widget_answered_visitor'),
        title: t('appHome.web.firstConversation'),
        text: t('appHome.web.firstConversationText'),
        waiting: true,
        action: has('widget_visitor') ? { to: `${base}/conversations`, label: t('appHome.web.seeConversations') } : undefined,
      },
    ];
    return (
      <HomeLayout
        intro={
          !location.state?.justCreated || failed
            ? undefined
            : jobId
              ? t('appHome.web.justCreated')
              : t('appHome.web.justCreatedNoCrawl')
        }
        steps={steps}
        side={
          <>
            <SideBox title={t('appHome.live.title')}>
              <div className="grid grid-cols-2 gap-3">
                <Stat value={m.widget_visitor?.count ?? 0} label={t('appHome.live.visitors')} />
                {/* null: answered before answers were counted, number unknown. */}
                {m.widget_answered_visitor?.count !== null && (
                  <Stat value={m.widget_answered_visitor?.count ?? 0} label={t('appHome.live.answered')} />
                )}
                <Stat value={pages} label={t('appHome.live.pages')} />
                <Stat value={docs} label={t('appHome.live.docs')} />
                <Link to={`${base}/conversations?view=requests`} className="hover:underline" data-testid="home-requests">
                  <Stat value={requests.items.length} label={t('appHome.live.requests')} />
                </Link>
              </div>
            </SideBox>
            <AddToApp base={base} />
          </>
        }
      />
    );
  }

  if (goal === 'sdk') {
    const steps: StepDef[] = [
      {
        done: false,
        current: true,
        title: t('appHome.sdk.keys'),
        text: t('appHome.sdk.keysText'),
        body: <SdkKeys app={app} />,
      },
      {
        done: (app.stats?.totalRegistered ?? 0) > 1,
        title: t('appHome.sdk.users'),
        text: t('appHome.sdk.usersText'),
        action: { to: `${base}/users`, label: t('appHome.sdk.usersAction') },
      },
      {
        done: (app.stats?.totalChats ?? 0) > 0,
        title: t('appHome.sdk.firstMessage'),
        text: t('appHome.sdk.firstMessageText'),
        waiting: true,
      },
    ];
    return <HomeLayout steps={steps} side={<AddToApp base={base} assistant />} />;
  }

  // messenger
  const steps: StepDef[] = [
    {
      done: Boolean(app.logoImage),
      title: t('appHome.messenger.brand'),
      text: t('appHome.messenger.brandText'),
      action: { to: `${base}/settings?tab=Appearance`, label: t('appHome.messenger.brandAction') },
    },
    {
      done: (app.stats?.totalRegistered ?? 0) > 1,
      title: t('appHome.messenger.invite'),
      text: t('appHome.messenger.inviteText'),
      action: { to: `${base}/users`, label: t('appHome.messenger.inviteAction') },
    },
    {
      done: false,
      title: t('appHome.messenger.apps'),
      text: t('appHome.messenger.appsText'),
      action: { to: `${base}/settings?tab=Web+App`, label: t('appHome.messenger.appsAction') },
    },
  ];
  return (
    <HomeLayout
      steps={steps}
      side={
        <>
          <SideBox title={t('appHome.messenger.safetyTitle')}>
            <p className="text-sm text-gray-600">{t('appHome.messenger.safetyText')}</p>
            <Link className="mt-2 inline-block text-sm text-brand-500 underline" to={`${base}/settings?tab=Trust+%26+Safety`}>
              {t('appHome.messenger.safetyAction')}
            </Link>
          </SideBox>
          <AddToApp base={base} assistant />
        </>
      }
    />
  );
}

interface StepDef {
  done: boolean;
  current?: boolean;
  waiting?: boolean;
  title: string;
  text: string;
  action?: { to: string; label: string };
  body?: ReactNode;
}

function HomeLayout({ steps, side, intro }: { steps: StepDef[]; side: ReactNode; intro?: string }) {
  const { t } = useTranslation();
  const next = steps.findIndex((s) => !s.done);
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]" data-testid="app-home">
      <div>
        {intro && <p className="mb-3 rounded-xl bg-brand-50 p-3 text-sm text-gray-800">{intro}</p>}
        <ol className="space-y-2">
          {steps.map((s, i) => {
            const now = !s.done && (s.current || i === next);
            return (
              <li
                key={s.title}
                data-testid={`home-step-${i + 1}`}
                data-done={s.done || undefined}
                className={`rounded-xl border p-3 ${s.done ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/40' : now ? 'border-brand-500 bg-white ring-2 ring-brand-100' : 'border-gray-200 bg-white'}`}
              >
                <div className="grid grid-cols-[28px_1fr] items-start gap-3 sm:grid-cols-[28px_1fr_auto] sm:items-center">
                  <span
                    aria-hidden="true"
                    className={`flex size-6 items-center justify-center rounded-full border-2 text-xs font-bold ${s.done ? 'border-green-600 bg-green-600 text-white' : now ? 'border-brand-500 text-brand-500' : 'border-gray-300 text-gray-500'}`}
                  >
                    {s.done ? '✓' : i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {s.title}
                      <span className="sr-only"> ({s.done ? t('appHome.done') : t('appHome.notDone')})</span>
                    </p>
                    <p className="text-sm text-gray-600">{s.text}</p>
                  </div>
                  <div className="col-start-2 sm:col-start-auto">
                    {s.action ? (
                      <Link
                        to={s.action.to}
                        className={`inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-semibold ${now ? 'bg-brand-500 text-white hover:bg-brand-darker' : 'border border-gray-300 bg-white text-gray-800'}`}
                      >
                        {s.action.label}
                      </Link>
                    ) : s.waiting && !s.done ? (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">{t('appHome.waiting')}</span>
                    ) : null}
                  </div>
                </div>
                {s.body && <div className="mt-3 sm:pl-10">{s.body}</div>}
              </li>
            );
          })}
        </ol>
      </div>
      <div className="space-y-3">{side}</div>
    </div>
  );
}

function SideBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-2 font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <b className="block text-xl">{value}</b>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
}

function AddToApp({ base, assistant = false }: { base: string; assistant?: boolean }) {
  const { t } = useTranslation();
  const links = [
    ...(assistant ? [{ to: `${base}/assistant`, label: t('appHome.add.assistant') }] : []),
    { to: `${base}/settings?tab=Appearance&section=chat`, label: t('appHome.add.chat') },
    { to: `${base}/settings?tab=Mobile+App`, label: t('appHome.add.mobile') },
    { to: `${base}/settings?tab=Web+App`, label: t('appHome.add.web') },
  ];
  return (
    <SideBox title={t('appHome.add.title')}>
      <p className="text-sm">
        {links.map((l, i) => (
          <span key={l.to}>
            {i > 0 && <span className="px-1 text-gray-400">·</span>}
            <Link className="text-brand-500 underline" to={l.to}>{l.label}</Link>
          </span>
        ))}
      </p>
    </SideBox>
  );
}

// "Chat and calls in my app", step 1: what a developer pastes.
function SdkKeys({ app }: { app: ModelApp }) {
  const { t } = useTranslation();
  const api = String(env.VITE_API || '<api-base>/v1');
  const xmppHost = String(env.VITE_XMPP_HOST || '<xmpp-host>');
  const xmppService = String(env.VITE_XMPP_SERVICE || `wss://${xmppHost}/ws`);
  const snippet = `npm install @ethora/chat-component

import { Chat } from '@ethora/chat-component';

export function Messenger() {
  return (
    <Chat
      config={{
        appId: '${app._id}',
        baseUrl: '${api}',
        xmppSettings: {
          devServer: '${xmppService}',
          host: '${xmppHost}',
          conference: 'conference.${xmppHost}',
        },
      }}
    />
  );
}`;
  return (
    <div className="space-y-3 text-sm">
      <dl className="grid gap-2 sm:grid-cols-[8rem_1fr]">
        <dt className="font-medium text-gray-700">{t('appHome.sdk.appId')}</dt>
        <dd className="flex min-w-0 items-center gap-2 break-all font-mono">{app._id}<CopyButton value={app._id} /></dd>
        <dt className="font-medium text-gray-700">{t('appHome.sdk.appSecret')}</dt>
        <dd className="flex min-w-0 items-center gap-2"><Secret className="" value={app.appSecret} /><CopyButton value={app.appSecret} /></dd>
      </dl>
      <p className="text-xs text-gray-500">{t('appHome.sdk.secretNote')}</p>
      <div className="relative">
        <pre className="max-h-80 overflow-auto rounded-lg bg-gray-900 p-3 text-xs leading-5 text-gray-100"><code>{snippet}</code></pre>
        <div className="absolute right-2 top-2 rounded bg-white/90"><CopyButton value={snippet} /></div>
      </div>
      <p className="text-xs text-gray-500">
        {t('appHome.sdk.more')}{' '}
        <a className="text-brand-500 underline" href="https://github.com/dappros/ethora-chat-component" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
      </p>
    </div>
  );
}

function ChooseGoal({ app, onChosen }: { app: ModelApp; onChosen: (goal: Goal) => void }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const pick = async (goal: Goal) => {
    setBusy(true);
    try {
      await httpUpdateApp(app._id, { onboardingGoal: goal });
      onChosen(goal);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="max-w-3xl" data-testid="app-home-choose">
      <h2 className="text-lg font-semibold">{t('appHome.choose.title')}</h2>
      <p className="mt-1 text-sm text-gray-600">{t('appHome.choose.text')}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {(['website', 'sdk', 'messenger'] as Goal[]).map((g) => (
          <button key={g} type="button" disabled={busy} onClick={() => void pick(g)} className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-brand-500 disabled:opacity-50">
            <GoalIllustration goal={g} />
            <span className="block font-semibold">{t(`onboarding.goal.${g}`)}</span>
            <span className="mt-1 block text-sm text-gray-600">{t(`onboarding.goal.${g}Desc`)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
