// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved

import { useCallback, useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Loading } from '../components/Loading';
import { httpOpenMyAgentChat } from '../http';
import { useTranslation } from '../i18n/useTranslation';
import { apiError } from '../utils/apiError';
import { clearReturnPath } from '../utils/returnPath';
import ChatPage from './Chat';

type Failure = 'notFound' | 'notAvailable' | 'off' | 'error';

function failureOf(e: unknown): Failure {
  const { code, status } = apiError(e);
  if (code === 'AGENT_NOT_FOUND' || status === 404) return 'notFound';
  if (code === 'AGENT_NOT_AVAILABLE' || status === 403) return 'notAvailable';
  if (code === 'AGENT_OFF') return 'off';
  return 'error';
}

export default function AgentChatJoinPage() {
  const { address = '' } = useParams<{ address: string }>();
  const { t } = useTranslation();
  const [roomJID, setRoomJID] = useState<string | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setRoomJID(null);
    setFailure(null);
    clearReturnPath();
    httpOpenMyAgentChat(address)
      .then(({ data }) => {
        if (!cancelled) setRoomJID(data.chatJid);
      })
      .catch((e) => {
        if (!cancelled) setFailure(failureOf(e));
      });
    return () => {
      cancelled = true;
    };
  }, [address, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (failure) {
    return (
      <div
        className="h-full min-h-[320px] flex items-center justify-center p-6 bg-white rounded-none md:rounded-2xl"
        data-testid="agent-chat-join-error"
        data-reason={failure}
      >
        <div className="max-w-[440px] text-center flex flex-col items-center gap-3 font-sans">
          <h1 className="text-2xl font-medium">{t(`agentChatJoin.${failure}.title`)}</h1>
          <p className="text-gray-600">{t(`agentChatJoin.${failure}.description`)}</p>
          <div className="flex gap-3 mt-2">
            {failure === 'error' && (
              <button type="button" onClick={retry} className="rounded-xl border border-gray-300 px-4 py-2">
                {t('agentChatJoin.retry')}
              </button>
            )}
            <NavLink to="/app/chat" replace className="rounded-xl bg-brand-500 text-white px-4 py-2">
              {t('agentChatJoin.goToChats')}
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  if (!roomJID) {
    return (
      <div
        className="h-full min-h-[320px] flex flex-col items-center justify-center gap-3 bg-white rounded-none md:rounded-2xl"
        data-testid="agent-chat-join-loading"
      >
        <Loading />
        <span>{t('agentChatJoin.loading')}</span>
      </div>
    );
  }

  return <ChatPage roomJID={roomJID} />;
}
