// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// What a base-app user may do across the whole installation, as opposed to
// inside one app (that is the ACL modal). Superadmins only; the backend
// refuses anyone else and any app but the base app.
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { httpGetPlatformAccess, httpSetPlatformAccess, PlatformAccess } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelAppUser } from '../../models';
import { apiError } from '../../utils/apiError';
import { CheckboxApp } from '../CheckboxApp';
import { SubmitModal } from './SubmitModal';

interface Props {
  appId: string;
  user: ModelAppUser;
  isSelf: boolean;
  onClose: () => void;
  onChanged: () => void;
}

type Key = keyof Omit<PlatformAccess, 'userId'>;
const KEYS: Key[] = ['superadmin', 'agents', 'netStats'];

export function PlatformAccessModal({ appId, user, isSelf, onClose, onChanged }: Props) {
  const { t } = useTranslation();
  const [initial, setInitial] = useState<PlatformAccess | null>(null);
  const [draft, setDraft] = useState<PlatformAccess | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    httpGetPlatformAccess(appId, user._id)
      .then((res) => {
        setInitial(res.data);
        setDraft(res.data);
      })
      .catch((e: unknown) => {
        toast.error(`${t('platformAccess.loadFailedPrefix')} ${apiError(e).message}`);
        onClose();
      });
  }, [appId, user._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (!initial || !draft) return;
    const changes: Partial<Record<Key, boolean>> = {};
    KEYS.forEach((k) => {
      if (draft[k] !== initial[k]) changes[k] = draft[k];
    });
    if (!Object.keys(changes).length) {
      onClose();
      return;
    }
    setBusy(true);
    try {
      await httpSetPlatformAccess(appId, user._id, changes);
      toast(t('platformAccess.savedToast'));
      onChanged();
      onClose();
    } catch (e: unknown) {
      const { code, message } = apiError(e);
      if (code === 'CANNOT_REVOKE_SELF') toast.error(t('platformAccess.revokeSelf'));
      else toast.error(`${t('platformAccess.saveFailedPrefix')} ${message}`);
    } finally {
      setBusy(false);
    }
  };

  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

  return (
    <SubmitModal onClose={onClose}>
      <div className="font-varela text-[22px] text-center mb-2 pr-8">{t('platformAccess.title').replace('{user}', name)}</div>
      <p className="font-sans text-xs text-gray-500 text-center mb-6">{t('platformAccess.description')}</p>
      {!draft ? (
        <div className="font-sans text-sm text-gray-500 text-center py-8">{t('platformAccess.loading')}</div>
      ) : (
        <div className="flex flex-col gap-2 mb-8">
          {KEYS.map((k) => {
            const locked = k === 'superadmin' && isSelf;
            return (
              <label
                key={k}
                className={`flex items-start gap-3 rounded-xl border border-gray-200 px-4 py-3 ${locked ? 'bg-gray-50' : 'cursor-pointer hover:bg-gray-50'}`}
                title={locked ? t('platformAccess.revokeSelf') : undefined}
              >
                <div className="pt-0.5">
                  <CheckboxApp checked={draft[k]} disabled={locked || busy} onChange={(on) => setDraft({ ...draft, [k]: on })} />
                </div>
                <div className="min-w-0">
                  <div className="font-sans text-sm">{t(`platformAccess.${k}`)}</div>
                  <div className="font-sans text-xs text-gray-500">{t(`platformAccess.${k}_hint`)}</div>
                </div>
              </label>
            );
          })}
        </div>
      )}
      <div className="grid grid-cols-2 gap-8">
        <button className="w-full rounded-xl border py-[12px] border-brand-500 text-brand-500" onClick={onClose} disabled={busy}>
          {t('platformAccess.cancel')}
        </button>
        <button className="w-full rounded-xl bg-brand-500 py-[12px] text-white hover:bg-brand-darker disabled:opacity-60" onClick={save} disabled={busy || !draft}>
          {t('platformAccess.save')}
        </button>
      </div>
    </SubmitModal>
  );
}
