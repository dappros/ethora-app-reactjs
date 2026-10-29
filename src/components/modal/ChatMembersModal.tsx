import { Dialog, DialogPanel } from '@headlessui/react';
import { CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  httpGetAppChatMembersV2,
  httpRemoveAppChatMembersV2,
  ModelChatMember,
} from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { IconClose } from '../Icons/IconClose';

interface Props {
  appId: string;
  chatJid: string;
  chatTitle: string;
  onClose: () => void;
}

// Statuses from DELETE /chats/users-access that leave the user out of the
// room - 'not-a-member' means someone else already removed them.
const REMOVED_STATUSES = new Set(['removed', 'not-a-member']);

function getChatNameFromJid(jid: string) {
  const s = String(jid || '');
  return s.split('@')[0] || s;
}

// Settings > Chats > click a chat: lists its members and lets the owner
// remove one from this room only (the account itself is untouched).
export function ChatMembersModal({
  appId,
  chatJid,
  chatTitle,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const chatName = getChatNameFromJid(chatJid);
  const [members, setMembers] = useState<ModelChatMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    httpGetAppChatMembersV2(appId, chatName)
      .then((list) => {
        if (!cancelled) setMembers(list);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [appId, chatName]);

  const getName = (m: ModelChatMember) => {
    const full = [m.firstName, m.lastName].filter(Boolean).join(' ').trim();
    return full || t('appSettingsChats.unnamedMember');
  };

  const onRemove = async (member: ModelChatMember) => {
    if (!member.xmppUsername) return;
    const name = getName(member);
    setRemovingId(member._id);
    try {
      const { data } = await httpRemoveAppChatMembersV2(appId, chatName, [
        member.xmppUsername,
      ]);
      const status = data.details?.[0]?.status;
      if (!status || !REMOVED_STATUSES.has(status)) throw new Error(status);
      setMembers((prev) => prev.filter((m) => m._id !== member._id));
      toast.success(
        t('appSettingsChats.memberRemovedToast').replace('{name}', name)
      );
    } catch {
      toast.error(
        t('appSettingsChats.memberRemoveError').replace('{name}', name)
      );
    } finally {
      setRemovingId(null);
      setConfirmId(null);
    }
  };

  return (
    <Dialog
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50"
      open={true}
      onClose={onClose}
    >
      <DialogPanel className="p-4 sm:p-8 bg-white rounded-3xl w-full max-w-[640px] m-4 sm:m-8 relative flex flex-col max-h-[calc(100vh-32px)]">
        <button
          className="absolute top-[15px] right-[15px]"
          onClick={onClose}
          aria-label={t('appSettingsChats.cancelButton')}
        >
          <IconClose />
        </button>
        <div className="font-varela text-[18px] md:text-[24px] text-center mb-4 px-8 break-words">
          {t('appSettingsChats.membersDialogTitle').replace(
            '{title}',
            chatTitle
          )}
        </div>
        <p className="font-sans text-xs text-gray-500 mb-4 text-center">
          {t('appSettingsChats.membersRejoinNote')}
        </p>
        <div className="overflow-y-auto -mx-2 px-2">
          {loading && (
            <div className="py-8 flex justify-center">
              <CircularProgress size={28} />
            </div>
          )}
          {!loading && loadError && (
            <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl">
              {t('appSettingsChats.membersLoadError')}
            </div>
          )}
          {!loading && !loadError && !members.length && (
            <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl">
              {t('appSettingsChats.membersEmpty')}
            </div>
          )}
          {!loading && !loadError && !!members.length && (
            <ul className="divide-y divide-gray-100">
              {members.map((m) => {
                const name = getName(m);
                const isConfirming = confirmId === m._id;
                const isRemoving = removingId === m._id;
                const avatar = m.profileImage || m.profilePicture;
                return (
                  <li key={m._id} className="flex items-center gap-3 py-3">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt=""
                        className="w-[36px] h-[36px] rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-[36px] h-[36px] rounded-full bg-brand-150 text-brand-500 flex items-center justify-center font-sans text-sm shrink-0">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-sans text-sm truncate">{name}</div>
                    </div>
                    {isConfirming ? (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setConfirmId(null)}
                          disabled={isRemoving}
                          className="rounded-xl border px-3 py-1.5 text-sm border-brand-500 text-brand-500 hover:bg-brand-hover disabled:opacity-50"
                        >
                          {t('appSettingsChats.cancelButton')}
                        </button>
                        <button
                          onClick={() => onRemove(m)}
                          disabled={isRemoving}
                          className="rounded-xl px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                        >
                          {t('appSettingsChats.removeMemberConfirmButton')}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(m._id)}
                        disabled={!m.xmppUsername || !!removingId}
                        className="shrink-0 rounded-xl border px-3 py-1.5 text-sm border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                      >
                        {t('appSettingsChats.removeMemberButton')}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogPanel>
    </Dialog>
  );
}
