import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { actionSwitchChatApp } from '../actions';
import { httpAppAssistantRequests, httpOpenAssistantRequestChat, type AppAssistantRequest } from '../http';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store/useAppStore';
import { apiError } from '../utils/apiError';

const PAGE_SIZE = 25;

export default function AppAssistantRequests() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [offset, setOffset] = useState(0);
  const [response, setResponse] = useState<{ items: AppAssistantRequest[]; total: number } | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [openingRequest, setOpeningRequest] = useState<string | null>(null);
  const [failedRequest, setFailedRequest] = useState<string | null>(null);
  useEffect(() => {
    if (!appId) return;
    let active = true;
    setResponse(null);
    setError('');
    httpAppAssistantRequests(appId, offset).then(({ data }) => {
      if (active) setResponse(data);
    }).catch((e) => {
      if (active) setError(apiError(e, 'Could not load assistant requests.').message);
    });
    return () => { active = false; };
  }, [appId, offset, refresh]);

  async function messageClient(requestId: string) {
    if (!appId || openingRequest) return;
    const { currentUser, chatAppId, ownerSession } = useAppStore.getState();
    if (!currentUser) return;
    const nextChatApp = currentUser.appId === appId ? null : appId;
    const needsSwitch = chatAppId !== nextChatApp || (nextChatApp !== null && ownerSession?.appId !== nextChatApp);
    setOpeningRequest(requestId);
    setFailedRequest(null);
    try {
      if (nextChatApp && needsSwitch) await actionSwitchChatApp(nextChatApp);
      const { data } = await httpOpenAssistantRequestChat(appId, requestId);
      if (!nextChatApp && needsSwitch) await actionSwitchChatApp(null);
      navigate(`/app/chat?${new URLSearchParams({ chatId: data.chatName })}`);
    } catch {
      if (nextChatApp && needsSwitch && useAppStore.getState().chatAppId === nextChatApp) {
        await actionSwitchChatApp(chatAppId).catch(() => actionSwitchChatApp(null));
      }
      setFailedRequest(requestId);
    } finally {
      setOpeningRequest(null);
    }
  }

  return <section className="mx-auto max-w-4xl space-y-4 p-2 md:p-4">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-2xl font-semibold">Assistant requests</h2>
        <p className="mt-1 text-sm text-gray-600">Review the requests members and visitors completed with this app’s assistants.</p></div>
      <button type="button" className="rounded-xl border border-gray-300 px-4 py-2 text-sm" onClick={() => setRefresh((n) => n + 1)}>Refresh</button>
    </header>
    {error ? <p role="alert" className="rounded-xl border border-red-400 p-4 text-sm">{error}</p> : !response ? <p role="status" className="rounded-xl bg-gray-100 p-4 text-sm">Loading requests…</p> : response.items.length === 0 ?
      <p className="rounded-xl border border-gray-200 p-5 text-sm text-gray-600">No requests yet. Completed booking and intake forms will appear here.</p> :
      <div className="space-y-3">{response.items.map((item) => <details key={item._id} className="rounded-xl border border-gray-200 p-4">
        <summary className="cursor-pointer font-semibold">
          <span>{item.flowKey.replace(/[-_]/g, ' ') || 'Assistant request'}</span>
          <time dateTime={item.completedAt} className="ml-3 text-sm font-normal text-gray-600">{new Date(item.completedAt).toLocaleString()}</time>
        </summary>
        {item.canMessageClient && <div className="mt-3">
          <button type="button" className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={openingRequest !== null} onClick={() => void messageClient(item._id)}>
            {t(openingRequest === item._id ? 'assistantRequests.openingChat' : 'assistantRequests.messageClient')}
          </button>
          {failedRequest === item._id && <p role="alert" className="mt-2 text-sm text-gray-700">
            {t('assistantRequests.openChatFailed')}
          </p>}
        </div>}
        <dl className="mt-3 space-y-2 text-sm">{item.answers.map((answer, i) => <div key={`${answer.id}-${i}`} className="break-words">
          <dt className="font-medium">{answer.question || answer.id}</dt><dd className="whitespace-pre-wrap text-gray-700">{answer.value}</dd>
        </div>)}</dl>
      </details>)}</div>}
    {response && response.total > PAGE_SIZE && <nav aria-label="Request pages" className="flex items-center gap-3 text-sm">
      <button disabled={offset === 0} onClick={() => setOffset((n) => Math.max(0, n - PAGE_SIZE))}>Previous</button>
      <span>Page {offset / PAGE_SIZE + 1} of {Math.ceil(response.total / PAGE_SIZE)}</span>
      <button disabled={offset + PAGE_SIZE >= response.total} onClick={() => setOffset((n) => n + PAGE_SIZE)}>Next</button>
    </nav>}
  </section>;
}
