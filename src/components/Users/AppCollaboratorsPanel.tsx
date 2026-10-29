// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AppCollaborator, httpListAppCollaborators, httpRemoveAppCollaborator } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { useAppStore } from '../../store/useAppStore';
import { accessErrorMessage } from '../../utils/accessError';

interface Props {
  appId: string;
  onInvite: () => void;
  refreshKey?: unknown;
}

export function AppCollaboratorsPanel({ appId, onInvite, refreshKey }: Props) {
  const { t } = useTranslation();
  const currentUserId = useAppStore((s) => s.currentUser?._id);
  const [items, setItems] = useState<AppCollaborator[] | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    httpListAppCollaborators(appId)
      .then((r) => setItems(r.data?.items || []))
      .catch(() => setItems(null));
  }, [appId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const remove = async (c: AppCollaborator) => {
    setBusyId(c.userId);
    try {
      await httpRemoveAppCollaborator(appId, c.userId);
      toast(t('appCollaborators.removedToast').replace('{name}', displayName(c)));
      setConfirmId(null);
      load();
    } catch (e) {
      toast.error(accessErrorMessage(e, t));
    } finally {
      setBusyId(null);
    }
  };

  if (!items) return null;
  const onlyOwner = items.every((c) => c.isOwner);

  return (
    <section className="rounded-xl border border-gray-200 p-4 mb-4" data-testid="app-collaborators">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-semibold text-base">{t('appCollaborators.title')}</h3>
          <p className="text-xs text-gray-500">{t('appCollaborators.subtitle')}</p>
        </div>
        <button
          onClick={onInvite}
          className="h-[36px] rounded-xl bg-brand-500 hover:bg-brand-darker text-white text-sm font-varela px-4"
        >
          {t('appUsers.inviteColleague')}
        </button>
      </div>

      <ul className="divide-y divide-gray-100">
        {items.map((c) => {
          const removable = !c.isOwner && c.userId !== currentUserId;
          return (
            <li key={c.userId} className="flex flex-wrap items-center gap-3 py-2">
              <span className="w-8 h-8 rounded-full bg-brand-150 text-brand-500 text-xs font-semibold flex items-center justify-center shrink-0">
                {initials(c)}
              </span>
              <span className="flex-1 min-w-[12rem]">
                <span className="block text-sm font-medium">
                  {displayName(c)}
                  {c.userId === currentUserId && <span className="text-gray-500 font-normal"> ({t('appCollaborators.you')})</span>}
                </span>
                <span className="block text-xs text-gray-500">{c.email}</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {c.role === 'owner' ? t('appCollaborators.roleOwner') : t(`aclModal.preset_${c.role}`)}
              </span>
              {removable &&
                (confirmId === c.userId ? (
                  <span className="flex items-center gap-2 text-sm">
                    <button
                      onClick={() => remove(c)}
                      disabled={busyId === c.userId}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      {t('appCollaborators.removeConfirm')}
                    </button>
                    <button onClick={() => setConfirmId(null)} className="text-gray-500 hover:underline">
                      {t('appCollaborators.removeCancel')}
                    </button>
                  </span>
                ) : (
                  <button onClick={() => setConfirmId(c.userId)} className="text-sm text-gray-500 hover:text-red-600 hover:underline">
                    {t('appCollaborators.remove')}
                  </button>
                ))}
            </li>
          );
        })}
      </ul>

      {onlyOwner && <p className="mt-3 text-sm bg-brand-150 rounded-xl p-3">{t('appUsers.inviteColleagueHint')}</p>}
    </section>
  );
}

function displayName(c: AppCollaborator) {
  return `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email;
}

function initials(c: AppCollaborator) {
  const name = displayName(c);
  return name.slice(0, 2).toUpperCase();
}
