// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved

import { Dialog, DialogPanel } from '@headlessui/react';
import classNames from 'classnames';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { AppCollaboratorInvite, AppCollaboratorRole, httpInviteAppCollaborator } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { accessErrorMessage } from '../../utils/accessError';
import { apiError } from '../../utils/apiError';
import CopyButtonText from '../UI/Buttons/CopyButtonText';
import { IconClose } from '../Icons/IconClose';
import CustomInput from '../input/Input';

interface Props {
  appId: string;
  appName?: string;
  onClose: () => void;
  onInvited: () => void;
}

type Inputs = { email: string; firstName: string; lastName: string };
type Role = AppCollaboratorRole;

const ROLES: Role[] = ['admin', 'userManager', 'analyst'];
const INVITE_ERRORS: Record<string, string> = {
  CANNOT_CHANGE_OWN_ROLE: 'inviteColleague.errorSelf',
  OWNER_ROLE_FIXED: 'inviteColleague.errorOwner',
  ROLE_EXCEEDS_OWN_ACCESS: 'inviteColleague.errorRoleAbove',
  USER_ARCHIVED: 'inviteColleague.errorArchived',
  USER_TOKEN_REQUIRED: 'inviteColleague.errorUserToken',
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteColleagueModal({ appId, appName, onClose, onInvited }: Props) {
  const { t } = useTranslation();
  const [role, setRole] = useState<Role>('admin');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<AppCollaboratorInvite | null>(null);
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm<Inputs>();
  const field = (...args: Parameters<typeof register>) => {
    const { ref, ...rest } = register(...args);
    return { ...rest, inputRef: ref };
  };

  const onSubmit: SubmitHandler<Inputs> = async ({ email, firstName, lastName }) => {
    setBusy(true);
    setError('');
    try {
      const { data } = await httpInviteAppCollaborator(appId, {
        email: email.trim(),
        role,
        ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
        ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
      });
      onInvited();
      setDone(data);
    } catch (e) {
      const { code } = apiError(e);
      if (code === 'FIRST_NAME_REQUIRED') {
        setFieldError('firstName', { message: t('inviteColleague.firstNameNeeded') });
      } else {
        setError(code && INVITE_ERRORS[code] ? t(INVITE_ERRORS[code]) : accessErrorMessage(e, t));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open
      onClose={() => {
        if (!busy) onClose();
      }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      aria-label={t('inviteColleague.title')}
    >
      <DialogPanel className="relative bg-white rounded-xl w-[560px] max-w-[92%] max-h-[90vh] flex flex-col overflow-hidden">
        <button
          type="button"
          className="absolute top-[15px] right-[15px] z-10"
          onClick={onClose}
          disabled={busy}
          aria-label={t('inviteColleague.close')}
        >
          <IconClose />
        </button>

        {done ? (
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold pr-8">
              {done.created ? t('inviteColleague.doneTitle') : t('inviteColleague.doneAccessTitle')}
            </h3>
            <p className="text-sm">
              {(done.created
                ? done.emailSent
                  ? t('inviteColleague.doneTextCreated')
                  : t('inviteColleague.doneTextCreatedNoEmail')
                : done.hadAccess
                  ? t('inviteColleague.doneTextRoleChanged')
                  : t('inviteColleague.doneTextExisting')
              )
                .replace('{email}', done.email)
                .replace('{app}', appName || '')
                .replace('{role}', t(`aclModal.preset_${done.role}`))}
            </p>
            {done.tempPassword && (
              <div className="rounded-xl bg-gray-100 p-3 text-sm">
                <div className="text-xs text-gray-600 mb-1">{t('inviteColleague.tempPasswordLabel')}</div>
                <div className="flex items-center gap-2">
                  <code className="font-mono font-semibold break-all">{done.tempPassword}</code>
                  <CopyButtonText textToCopy={done.tempPassword} />
                </div>
                <div className="text-xs text-gray-500 mt-2">{t('inviteColleague.tempPasswordHint')}</div>
              </div>
            )}
            <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
              {done.created && <li>{t('inviteColleague.doneStep1')}</li>}
              <li>{t('inviteColleague.doneStep2').replace('{app}', appName || '')}</li>
            </ol>
            <div className="flex justify-end">
              <button onClick={onClose} className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2">
                {t('inviteColleague.doneButton')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
              <div className="pr-8">
                <h3 className="text-lg font-semibold">{t('inviteColleague.title')}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {t('inviteColleague.subtitle').replace('{app}', appName || '')}
                </p>
              </div>

              <label className="block">
                <span className="block text-xs font-semibold text-gray-600 mb-1">{t('inviteColleague.emailLabel')}</span>
                <CustomInput
                  fullWidth
                  type="email"
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  {...field('email', {
                    required: t('inviteColleague.emailRequired'),
                    pattern: { value: EMAIL_RE, message: t('inviteColleague.emailInvalid') },
                  })}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-600 mb-1">{t('inviteColleague.firstNameLabel')}</span>
                  <CustomInput
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    {...field('firstName')}
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-600 mb-1">{t('inviteColleague.lastNameLabel')}</span>
                  <CustomInput fullWidth {...field('lastName')} />
                </label>
              </div>

              <p className="text-xs text-gray-500 -mt-2">{t('inviteColleague.namesHint')}</p>

              <fieldset>
                <legend className="block text-xs font-semibold text-gray-600 mb-2">{t('inviteColleague.roleLabel')}</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {ROLES.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setRole(id)}
                      aria-pressed={role === id}
                      className={classNames(
                        'text-left rounded-xl border p-3 text-sm',
                        role === id ? 'border-brand-500 bg-brand-150 text-brand-500' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <div className="font-semibold">{t(`aclModal.preset_${id}`)}</div>
                      <div className="text-xs text-gray-500">{t(`aclModal.preset_${id}_hint`)}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">{t('inviteColleague.roleHint')}</p>
              </fieldset>

              {error && (
                <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800/60 dark:bg-red-900/30 dark:text-red-200" role="alert">
                  {error}
                </div>
              )}
            </div>
            <div className="shrink-0 flex justify-end gap-2 px-5 py-3 border-t">
              <button type="button" onClick={onClose} disabled={busy} className="border rounded px-4 py-2 hover:bg-gray-100">
                {t('inviteColleague.cancel')}
              </button>
              <button type="submit" disabled={busy} className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2 disabled:opacity-50">
                {busy ? t('inviteColleague.sending') : t('inviteColleague.send')}
              </button>
            </div>
          </form>
        )}
      </DialogPanel>
    </Dialog>
  );
}
