import { Dialog, DialogPanel } from '@headlessui/react';
import { CircularProgress } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
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

// DELETE /apps/:appId/chats/users-access accepts at most 100 members.
const REMOVE_BATCH_SIZE = 100;

function getChatNameFromJid(jid: string) {
  const s = String(jid || '');
  return s.split('@')[0] || s;
}

// Settings > Chats > click a chat: lists its members and lets the owner
// remove one or several from this room only (the account itself is untouched).
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
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [removingBulk, setRemovingBulk] = useState(false);

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

  const visibleMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.firstName, m.lastName, m.xmppUsername]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [members, query]);
  const selectableVisible = visibleMembers.filter((m) => m.xmppUsername);
  const allVisibleSelected =
    !!selectableVisible.length &&
    selectableVisible.every((m) => selected.has(m._id));
  const selectedMembers = members.filter((m) => selected.has(m._id));
  const busy = !!removingId || removingBulk;

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAllVisible = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      selectableVisible.forEach((m) =>
        allVisibleSelected ? next.delete(m._id) : next.add(m._id)
      );
      return next;
    });

  // Resolves to the members the server confirmed as out of the room.
  const removeMembers = async (list: ModelChatMember[]) => {
    const removed = new Set<string>();
    const usernames = list.map((m) => m.xmppUsername as string);
    for (let i = 0; i < usernames.length; i += REMOVE_BATCH_SIZE) {
      try {
        const { data } = await httpRemoveAppChatMembersV2(
          appId,
          chatName,
          usernames.slice(i, i + REMOVE_BATCH_SIZE)
        );
        (data.details || []).forEach((d) => {
          if (REMOVED_STATUSES.has(d.status)) removed.add(d.xmppUsername);
        });
      } catch {
        // The whole batch failed; its members stay in the list.
      }
    }
    const done = list.filter((m) => removed.has(m.xmppUsername as string));
    const doneIds = new Set(done.map((m) => m._id));
    setMembers((prev) => prev.filter((m) => !doneIds.has(m._id)));
    setSelected((prev) => {
      const next = new Set(prev);
      doneIds.forEach((id) => next.delete(id));
      return next;
    });
    return done;
  };

  const onRemove = async (member: ModelChatMember) => {
    if (!member.xmppUsername) return;
    const name = getName(member);
    setRemovingId(member._id);
    try {
      const done = await removeMembers([member]);
      if (done.length) {
        toast.success(
          t('appSettingsChats.memberRemovedToast').replace('{name}', name)
        );
      } else {
        toast.error(
          t('appSettingsChats.memberRemoveError').replace('{name}', name)
        );
      }
    } finally {
      setRemovingId(null);
      setConfirmId(null);
    }
  };

  const onRemoveSelected = async () => {
    const list = selectedMembers.filter((m) => m.xmppUsername);
    if (!list.length) return;
    setRemovingBulk(true);
    try {
      const done = await removeMembers(list);
      if (done.length) {
        toast.success(
          t('appSettingsChats.membersRemovedToast').replace(
            '{count}',
            String(done.length)
          )
        );
      }
      if (done.length < list.length) {
        toast.error(
          t('appSettingsChats.membersRemoveError').replace(
            '{count}',
            String(list.length - done.length)
          )
        );
      }
    } finally {
      setRemovingBulk(false);
      setConfirmBulk(false);
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
        {!loading && !loadError && !!members.length && (
          <div className="flex flex-col gap-3 mb-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('appSettingsChats.membersSearchPlaceholder')}
              aria-label={t('appSettingsChats.membersSearchPlaceholder')}
              className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 font-sans text-sm outline-none focus:border-brand-500"
            />
            <div className="flex items-center gap-3 min-h-[34px]">
              <label className="flex items-center gap-3 font-sans text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-brand-500"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  disabled={!selectableVisible.length || busy}
                />
                {t('appSettingsChats.membersSelectAll')}
              </label>
              {!!selectedMembers.length && (
                <span className="font-sans text-xs text-gray-500">
                  {t('appSettingsChats.membersSelectedCount').replace(
                    '{count}',
                    String(selectedMembers.length)
                  )}
                </span>
              )}
              {!!selectedMembers.length &&
                (confirmBulk ? (
                  <div className="ml-auto flex gap-2 shrink-0">
                    <button
                      onClick={() => setConfirmBulk(false)}
                      disabled={removingBulk}
                      className="rounded-xl border px-3 py-1.5 text-sm border-brand-500 text-brand-500 hover:bg-brand-hover disabled:opacity-50"
                    >
                      {t('appSettingsChats.cancelButton')}
                    </button>
                    <button
                      onClick={onRemoveSelected}
                      disabled={removingBulk}
                      className="rounded-xl px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    >
                      {t('appSettingsChats.removeMemberConfirmButton')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmBulk(true)}
                    disabled={busy}
                    className="ml-auto shrink-0 rounded-xl border px-3 py-1.5 text-sm border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                  >
                    {t('appSettingsChats.removeSelectedButton').replace(
                      '{count}',
                      String(selectedMembers.length)
                    )}
                  </button>
                ))}
            </div>
          </div>
        )}
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
          {!loading &&
            !loadError &&
            !!members.length &&
            !visibleMembers.length && (
              <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl">
                {t('appSettingsChats.membersNoMatches')}
              </div>
            )}
          {!loading && !loadError && !!visibleMembers.length && (
            <ul className="divide-y divide-gray-100">
              {visibleMembers.map((m) => {
                const name = getName(m);
                const isConfirming = confirmId === m._id;
                const isRemoving = removingId === m._id;
                const avatar = m.profileImage || m.profilePicture;
                return (
                  <li key={m._id} className="flex items-center gap-3 py-3">
                    <input
                      type="checkbox"
                      className="shrink-0 w-4 h-4 accent-brand-500"
                      checked={selected.has(m._id)}
                      onChange={() => toggleOne(m._id)}
                      disabled={!m.xmppUsername || busy}
                      aria-label={name}
                    />
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
                        disabled={!m.xmppUsername || busy}
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
