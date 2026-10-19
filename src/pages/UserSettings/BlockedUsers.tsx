import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Loading } from '../../components/Loading';
import { getBlockedUsers, unblockUser } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';

interface BlockedUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  xmppUsername?: string;
  createdAt?: string;
}

// The users this account has blocked in 1-1 private chats. Blocking hides the
// pair's rooms from the chat list and suppresses the blocked user's realtime
// messages (they stay archived); unblocking here restores the conversation.
export function BlockedUsers() {
  const { t } = useTranslation();
  const [items, setItems] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBlockedUsers();
      setItems((res?.data?.items as BlockedUser[]) ?? []);
    } catch {
      toast.error(t('userSettingsBlockedUsers.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUnblock = useCallback(
    async (user: BlockedUser) => {
      if (!user.xmppUsername) return;
      setPendingId(user._id);
      try {
        await unblockUser(user.xmppUsername);
        setItems((prev) => prev.filter((u) => u._id !== user._id));
        toast.success(t('userSettingsBlockedUsers.unblockSuccess'));
      } catch {
        toast.error(t('userSettingsBlockedUsers.unblockError'));
      } finally {
        setPendingId(null);
      }
    },
    [t]
  );

  const fullName = (u: BlockedUser) =>
    `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.xmppUsername || '';

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="subtitle1 mbc-16">
          {t('userSettingsBlockedUsers.title')}
        </div>
        <p className="text-sm text-gray-500">
          {t('userSettingsBlockedUsers.description')}
        </p>
      </div>

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">
          {t('userSettingsBlockedUsers.empty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((u) => (
            <li
              key={u._id}
              className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                {u.profileImage ? (
                  <img
                    src={u.profileImage}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gray-200" />
                )}
                <span className="truncate">{fullName(u)}</span>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                disabled={pendingId === u._id}
                onClick={() => void handleUnblock(u)}
              >
                {t('userSettingsBlockedUsers.unblock')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
