import { useState } from 'react';
import { toast } from 'react-toastify';
import { updateMe } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelCurrentUser } from '../../models';
import { useAppStore } from '../../store/useAppStore';

type VisibilityField = 'isProfileOpen' | 'isAssetsOpen';

// One of the two profile visibility flags, saved on change. Optimistic: the
// radio (and whatever the caller renders from `value`, e.g. the shares list
// under "Restricted") switches straight away and reverts if the save fails.
export function useVisibilitySetting(field: VisibilityField) {
  const { t } = useTranslation();
  const currentUser = useAppStore((s) => s.currentUser as ModelCurrentUser);
  const doUpdateUser = useAppStore((s) => s.doUpdateUser);
  const [value, setValue] = useState<boolean>(currentUser[field]);

  const onChange = (next: boolean) => {
    if (next === value) return;
    const previous = value;
    setValue(next);
    updateMe({ [field]: next })
      .then(({ data }) => {
        doUpdateUser(data.user);
        toast.success(t('userSettingsVisibility.toastSaved'));
      })
      .catch(() => {
        setValue(previous);
        toast.error(t('userSettingsVisibility.toastError'));
      });
  };

  return [value, onChange] as const;
}
