import { RadioGroup } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { RadioButton } from '../../components/RadioButton';
import { updateMe } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelCurrentUser } from '../../models';
import { useAppStore } from '../../store/useAppStore';

export function Visibility() {
  const { t } = useTranslation();
  const currentUser = useAppStore((s) => s.currentUser as ModelCurrentUser);
  const doUpdateUser = useAppStore((s) => s.doUpdateUser);
  const [isProfileOpen, setIsProfileOpen] = useState(currentUser.isProfileOpen);
  const [isAssetsOpen, setIsAssetsOpen] = useState(currentUser.isAssetsOpen);

  useEffect(() => {
    if (isProfileOpen !== currentUser.isProfileOpen) {
      updateMe({ isProfileOpen })
        .then(({ data }) => {
          doUpdateUser(data.user);
          toast.success(t('userSettingsVisibility.toastSaved'));
        })
        .catch(() => {
          toast.error(t('userSettingsVisibility.toastError'));
        });
    }
  }, [isProfileOpen]);

  useEffect(() => {
    if (isAssetsOpen !== currentUser.isAssetsOpen) {
      updateMe({ isAssetsOpen })
        .then(({ data }) => {
          doUpdateUser(data.user);
          toast.success(t('userSettingsVisibility.toastSaved'));
        })
        .catch(() => toast.error(t('userSettingsVisibility.toastError')));
    }
  }, [isAssetsOpen]);

  return (
    <div className="md:ml-4">
      <div className="font-sans font-semibold text-[16px] mb-4">
        {t('userSettingsVisibility.profileVisibilityHeading')}
      </div>
      <RadioGroup
        value={isProfileOpen}
        onChange={(value) => {
          setIsProfileOpen(value);
        }}
        aria-label="Server size"
        className="mb-8"
      >
        <RadioButton
          value={true}
          label={t('userSettingsVisibility.radioOpenLabel')}
          className="mb-2"
        />
        <p className="font-sans text-[12px] text-[#8C8C8C] mb-4">
          {t('userSettingsVisibility.profileOpenDescription')}
        </p>
        <RadioButton
          value={false}
          label={t('userSettingsVisibility.radioRestrictedLabel')}
          className="mb-2"
        />
        <p className="font-sans text-[12px] text-[#8C8C8C]">
          {t('userSettingsVisibility.profileRestrictedDescription')}
        </p>
      </RadioGroup>
      <div className="font-sans font-semibold text-[16px] mb-4">
        {t('userSettingsVisibility.documentsVisibilityHeading')}
      </div>
      <RadioGroup
        value={isAssetsOpen}
        onChange={(value) => {
          setIsAssetsOpen(value);
        }}
        aria-label="Server size"
      >
        <RadioButton
          value={true}
          label={t('userSettingsVisibility.radioFullLabel')}
          className="mb-2"
        />
        <p className="font-sans text-[12px] text-[#8C8C8C] mb-4">
          {t('userSettingsVisibility.documentsFullDescription')}
        </p>
        <RadioButton
          value={false}
          label={t('userSettingsVisibility.radioIndividualLabel')}
          className="mb-2"
        />
        <p className="font-sans text-[12px] text-[#8C8C8C]">
          {t('userSettingsVisibility.documentsIndividualDescription')}
        </p>
      </RadioGroup>
    </div>
  );
}
