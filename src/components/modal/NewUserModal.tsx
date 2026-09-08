import { Dialog, DialogPanel } from '@headlessui/react';
import { IconClose } from '../Icons/IconClose';

import { SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { Loading } from '../Loading';
import { generatePassword } from '../../utils/generatePassword';
import './NewUserModal.scss';

// Matches the `password` floor on POST /users/create-with-app-id/:id, which in
// turn matches the login route — anything shorter would be accepted here and
// then rejected at sign-in.
const PASSWORD_MIN_LENGTH = 6;

interface Props {
  onClose: () => void;
  onSubmit: SubmitHandler<Inputs>;
  loading: boolean;
}

export type Inputs = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export function NewUserModal({ onClose, onSubmit, loading }: Props) {
  // Lazy initialiser, so a fresh password is minted once per mount. AppUsers
  // renders this modal conditionally, so every open is a new mount and
  // therefore a new password.
  const [initialPassword] = useState(generatePassword);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({ defaultValues: { password: initialPassword } });
  const { t } = useTranslation();

  return (
    <Dialog className="new-user-modal" open={true} onClose={() => {}}>
      <DialogPanel className="inner">
        <div className="title">{t('newUserModal.title')}</div>
        <form onSubmit={handleSubmit(onSubmit)} action="">
          <div className="form">
            <input
              type="text"
              className="w-full rounded-xl bg-[#F5F7F9] outline-none mb-8 py-[12px] px-[16px]"
              placeholder={t('newUserModal.firstNamePlaceholder')}
              {...register('firstName', { required: true })}
            />
            <input
              type="text"
              className="w-full rounded-xl bg-[#F5F7F9] outline-none mb-8 py-[12px] px-[16px]"
              placeholder={t('newUserModal.lastNamePlaceholder')}
              {...register('lastName', { required: true })}
            />

            <div className="email">
              <input
                type="text"
                className="w-full rounded-xl bg-[#F5F7F9] outline-none mb-8 py-[12px] px-[16px]"
                placeholder={t('newUserModal.emailPlaceholder')}
                {...register('email', { required: true })}
              />
            </div>

            <div className="password">
              {/* Shown in clear text on purpose: the admin has to be able to
                  read it back, and it is handed over in the CSV anyway. */}
              <input
                type="text"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl bg-[#F5F7F9] outline-none py-[12px] px-[16px] font-mono"
                placeholder={t('newUserModal.passwordPlaceholder')}
                {...register('password', {
                  required: true,
                  minLength: {
                    value: PASSWORD_MIN_LENGTH,
                    message: t('newUserModal.passwordMinLength'),
                  },
                })}
              />
              <div className="password-meta">
                {errors.password ? (
                  <span className="password-error">
                    {errors.password.message ||
                      t('newUserModal.passwordMinLength')}
                  </span>
                ) : (
                  <span className="password-hint">
                    {t('newUserModal.passwordHint')}
                  </span>
                )}
                <button
                  type="button"
                  className="password-regenerate text-brand-500"
                  onClick={() =>
                    setValue('password', generatePassword(), {
                      shouldValidate: true,
                    })
                  }
                >
                  {t('newUserModal.passwordRegenerate')}
                </button>
              </div>
            </div>
          </div>
          <div className="buttons">
            <button
              type="button"
              className="w-full hover:bg-brand-hover rounded-xl border py-[12px] border-brand-500 text-brand-500"
              onClick={onClose}
            >
              {t('newUserModal.cancelButton')}
            </button>
            <button
              type="submit"
              className="w-full hover:bg-brand-darker py-[12px] rounded-xl bg-brand-500 text-white"
            >
              {t('newUserModal.continueButton')}
            </button>
          </div>
        </form>

        <button className="close" onClick={() => onClose()}>
          <IconClose />
        </button>
      </DialogPanel>
      {loading && <Loading></Loading>}
    </Dialog>
  );
}
