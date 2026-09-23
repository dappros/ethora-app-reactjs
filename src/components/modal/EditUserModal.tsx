// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Admin-side edit of one user of the app: name, description and tags.
// Name and description go through PUT /v1/users/:appId/:userId (validated
// server-side); tags are applied as a diff through the tag add / remove
// endpoints so the user's other tags are never clobbered.
import { Dialog, DialogPanel } from '@headlessui/react';
import { useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelAppUser } from '../../models';
import { IconClose } from '../Icons/IconClose';
import { Loading } from '../Loading';
import { TagsInput } from '../TagsInput';

type Inputs = { firstName: string; lastName: string; description: string };

interface Props {
  user: ModelAppUser;
  suggestions: string[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: Inputs & { tags: string[] }) => void;
}

export function EditUserModal({ user, suggestions, loading, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const [tags, setTags] = useState<string[]>(user.tags || []);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: { firstName: user.firstName || '', lastName: user.lastName || '', description: user.description || '' },
  });
  const submit: SubmitHandler<Inputs> = (values) => onSubmit({ ...values, tags });
  const inputClass = 'w-full rounded-xl bg-gray-100 outline-none py-[12px] px-[16px] text-sm';
  const roleLabel = useMemo(() => (user.role ? t(`appUsers.role_${user.role}`) : ''), [t, user.role]);

  return (
    <Dialog className="relative z-50" open={true} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-varela text-[24px]">{t('editUserModal.title')}</div>
              <div className="text-gray-500 text-[12px] font-sans">
                {user.email}
                {roleLabel ? ` · ${roleLabel}` : ''}
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label={t('editUserModal.close')}>
              <IconClose />
            </button>
          </div>
          <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-gray-500 text-[12px] font-sans mb-1">{t('editUserModal.firstName')}</div>
                <input
                  type="text"
                  className={inputClass}
                  placeholder={t('editUserModal.firstName')}
                  {...register('firstName', { required: true, minLength: 3, maxLength: 30 })}
                />
                {errors.firstName && <div className="text-red-500 text-[12px] mt-1">{t('editUserModal.nameRule')}</div>}
              </div>
              <div>
                <div className="text-gray-500 text-[12px] font-sans mb-1">{t('editUserModal.lastName')}</div>
                <input
                  type="text"
                  className={inputClass}
                  placeholder={t('editUserModal.lastName')}
                  {...register('lastName', { required: true, minLength: 3, maxLength: 30 })}
                />
                {errors.lastName && <div className="text-red-500 text-[12px] mt-1">{t('editUserModal.nameRule')}</div>}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-[12px] font-sans mb-1">{t('editUserModal.description')}</div>
              <textarea
                className={`${inputClass} min-h-[72px]`}
                placeholder={t('editUserModal.descriptionPlaceholder')}
                {...register('description', { maxLength: 300 })}
              />
            </div>
            <div>
              <div className="text-gray-500 text-[12px] font-sans mb-1">{t('editUserModal.tags')}</div>
              <TagsInput value={tags} onChange={setTags} suggestions={suggestions} placeholder={t('editUserModal.tagsPlaceholder')} />
            </div>
            <div className="flex gap-4 mt-2">
              <button type="button" onClick={onClose} className="rounded-xl hover:bg-brand-hover border-brand-500 border w-full text-center text-brand-500 p-2">
                {t('editUserModal.cancel')}
              </button>
              <button type="submit" disabled={loading} className="rounded-xl hover:bg-brand-darker bg-brand-500 border w-full text-center text-white p-2 disabled:opacity-50">
                {t('editUserModal.save')}
              </button>
            </div>
          </form>
          {loading && <Loading />}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
