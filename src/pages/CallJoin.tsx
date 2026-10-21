import { useCallback, useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Loading } from '../components/Loading';
import { useTranslation } from '../i18n/useTranslation';
import { CallJoinFailure, CallJoinOutcome } from '../utils/scheduledCall';
import { resolveScheduledCall } from '../utils/resolveScheduledCall';
import { clearReturnPath } from '../utils/returnPath';
import ChatPage from './Chat';

// /call/:slug, the join link in a calendar event or an invite card.
//
// Signed-out visitors never get here: AppLayout parks this path and sends them
// to the login, which brings them back (utils/returnPath.ts). Once signed in
// the slug is resolved, and then either the chat opens on that room with the
// pre-join panel (nothing starts until the user taps Join there), or one of
// the screens below explains why not. Every screen links to the chats.

const FAILURE_KEYS: Record<CallJoinFailure, string> = {
  'not-found': 'callJoin.notFound',
  'not-a-member': 'callJoin.notMember',
  cancelled: 'callJoin.cancelled',
  error: 'callJoin.error',
};

function CallJoinMessage({
  reason,
  onRetry,
}: {
  reason: CallJoinFailure;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const base = FAILURE_KEYS[reason];
  return (
    <div
      className="h-full min-h-[320px] flex items-center justify-center p-6 bg-white rounded-none md:rounded-2xl"
      data-testid="call-join-error"
      data-reason={reason}
    >
      <div className="max-w-[440px] text-center flex flex-col items-center gap-3 font-sans">
        <h1 className="text-2xl font-medium">{t(`${base}.title`)}</h1>
        <p className="text-gray-600">{t(`${base}.description`)}</p>
        <div className="flex gap-3 mt-2">
          {reason === 'error' && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-xl border border-gray-300 px-4 py-2"
            >
              {t('callJoin.retry')}
            </button>
          )}
          <NavLink
            to="/app/chat"
            replace
            className="rounded-xl bg-brand-500 text-white px-4 py-2"
          >
            {t('callJoin.goToChats')}
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default function CallJoinPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const [outcome, setOutcome] = useState<CallJoinOutcome | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setOutcome(null);
    // The user is signed in (AppLayout guarantees it), so a path parked
    // before the login has done its job.
    clearReturnPath();
    resolveScheduledCall(slug).then((result) => {
      if (!cancelled) setOutcome(result);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (!outcome) {
    return (
      <div
        className="h-full min-h-[320px] flex flex-col items-center justify-center gap-3 text-sm text-gray-500 font-sans"
        data-testid="call-join-loading"
      >
        <Loading />
        <span>{t('callJoin.loading')}</span>
      </div>
    );
  }

  if (!outcome.ok) {
    return <CallJoinMessage reason={outcome.reason} onRetry={retry} />;
  }

  return <ChatPage scheduledCallSlug={slug} roomJID={outcome.call.chat.jid} />;
}
