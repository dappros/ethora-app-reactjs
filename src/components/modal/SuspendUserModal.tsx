// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Suspend one or more users of an app: reason, optional message shown to the
// user, optional admin-only note, and the tenant scope (same email in the
// child apps + sign-up block). Suspension is not archive: the accounts and
// their data stay; only sign-in and API access are refused until lifted.
import { Dialog, DialogPanel } from '@headlessui/react';
import { useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelAppUser, SuspendUserBody, SuspensionReasonCode } from '../../models';
import {
  SUSPENSION_MESSAGE_MAX,
  SUSPENSION_NOTE_MAX,
  SUSPENSION_REASON_CODES,
  suspensionReasonKey,
} from '../../utils/suspension';
import { IconClose } from '../Icons/IconClose';

interface Props {
  users: ModelAppUser[];
  busy: boolean;
  onClose: () => void;
  onSubmit: (body: SuspendUserBody) => void;
}

export function SuspendUserModal({ users, busy, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const [reasonCode, setReasonCode] = useState<SuspensionReasonCode | ''>('');
  const [message, setMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [tenant, setTenant] = useState(false);

  const one = users.length === 1 ? users[0] : null;
  const name = one ? `${one.firstName || ''} ${one.lastName || ''}`.trim() || one.email || one._id : '';
  const title = one
    ? t('userSuspension.modal.titleOne').replace('{name}', name)
    : t('userSuspension.modal.titleMany').replace('{count}', String(users.length));

  const messageTooLong = message.trim().length > SUSPENSION_MESSAGE_MAX;
  const noteTooLong = internalNote.trim().length > SUSPENSION_NOTE_MAX;
  const canSubmit = Boolean(reasonCode) && !messageTooLong && !noteTooLong && !busy;

  const submit = () => {
    if (!canSubmit || !reasonCode) return;
    const body: SuspendUserBody = { reasonCode, scope: tenant ? 'tenant' : 'app' };
    if (message.trim()) body.message = message.trim();
    if (internalNote.trim()) body.internalNote = internalNote.trim();
    onSubmit(body);
  };

  const inputClass = 'w-full rounded-xl bg-gray-100 outline-none py-[12px] px-[16px] text-sm font-sans';
  const counter = (len: number, max: number) => (
    <span className={len > max ? 'text-red-600 dark:text-red-400' : ''}>
      {len}/{max}
    </span>
  );

  return (
    <Dialog className="relative z-50" open={true} onClose={busy ? () => {} : onClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-[560px] max-h-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="min-w-0">
              <div className="font-varela text-[24px] break-words">{title}</div>
              {one && <div className="text-gray-500 text-[12px] font-sans truncate">{one.email}</div>}
            </div>
            {!busy && (
              <button type="button" onClick={onClose} aria-label={t('userSuspension.modal.close')}>
                <IconClose />
              </button>
            )}
          </div>
          <p className="font-sans text-sm text-gray-700 mb-4">{t('userSuspension.modal.intro')}</p>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label className="block">
              <div className="text-gray-500 text-[12px] font-sans mb-1">{t('userSuspension.modal.reasonLabel')}</div>
              <select
                className={inputClass}
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value as SuspensionReasonCode | '')}
                required
                autoFocus
              >
                <option value="" disabled>
                  {t('userSuspension.modal.reasonPlaceholder')}
                </option>
                {SUSPENSION_REASON_CODES.map((code) => (
                  <option key={code} value={code}>
                    {t(suspensionReasonKey(code))}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <div className="flex justify-between text-gray-500 text-[12px] font-sans mb-1">
                <span>{t('userSuspension.modal.messageLabel')}</span>
                {counter(message.trim().length, SUSPENSION_MESSAGE_MAX)}
              </div>
              <textarea
                className={`${inputClass} min-h-[72px]`}
                placeholder={t('userSuspension.modal.messagePlaceholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              {messageTooLong && (
                <div className="text-red-500 text-[12px] mt-1">
                  {t('userSuspension.modal.tooLong').replace('{max}', String(SUSPENSION_MESSAGE_MAX))}
                </div>
              )}
            </label>
            <label className="block">
              <div className="flex justify-between text-gray-500 text-[12px] font-sans mb-1">
                <span>{t('userSuspension.modal.noteLabel')}</span>
                {counter(internalNote.trim().length, SUSPENSION_NOTE_MAX)}
              </div>
              <textarea
                className={`${inputClass} min-h-[72px]`}
                placeholder={t('userSuspension.modal.notePlaceholder')}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
              />
              {noteTooLong && (
                <div className="text-red-500 text-[12px] mt-1">
                  {t('userSuspension.modal.tooLong').replace('{max}', String(SUSPENSION_NOTE_MAX))}
                </div>
              )}
            </label>
            <div>
              <label className="flex items-start gap-2 cursor-pointer font-sans text-sm">
                <input
                  type="checkbox"
                  className="mt-[3px]"
                  checked={tenant}
                  onChange={(e) => setTenant(e.target.checked)}
                />
                <span>{t('userSuspension.modal.tenantLabel')}</span>
              </label>
              <p className="font-sans text-[12px] text-gray-500 mt-1 ml-6">{t('userSuspension.modal.tenantHelp')}</p>
            </div>
            <div className="flex gap-4 mt-2">
              <button
                type="button"
                disabled={busy}
                className="w-full py-3 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover disabled:opacity-50"
                onClick={onClose}
              >
                {t('userSuspension.modal.cancel')}
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-3 hover:bg-red-300 p-2 border bg-red-400 border-red-800 rounded-xl text-white disabled:opacity-50"
              >
                {busy ? t('userSuspension.modal.working') : t('userSuspension.modal.confirm')}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
