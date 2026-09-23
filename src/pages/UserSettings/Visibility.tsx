import { RadioGroup } from '@headlessui/react';
import { RadioButton } from '../../components/RadioButton';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ProfileVisibility({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <div className="font-sans font-semibold text-[16px] mb-4">
        {t('userSettingsVisibility.profileVisibilityHeading')}
      </div>
      <RadioGroup
        value={value}
        onChange={onChange}
        aria-label={t('userSettingsVisibility.profileVisibilityHeading')}
      >
        <RadioButton
          value={true}
          label={t('userSettingsVisibility.radioOpenLabel')}
          className="mb-2"
        />
        <p className="font-sans text-[12px] text-gray-500 mb-4">
          {t('userSettingsVisibility.profileOpenDescription')}
        </p>
        <RadioButton
          value={false}
          label={t('userSettingsVisibility.radioRestrictedLabel')}
          className="mb-2"
        />
        <p className="font-sans text-[12px] text-gray-500">
          {t('userSettingsVisibility.profileRestrictedDescription')}
        </p>
      </RadioGroup>
    </>
  );
}

export function DocumentsVisibility({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <div className="font-sans font-semibold text-[16px] mb-4">
        {t('userSettingsVisibility.documentsVisibilityHeading')}
      </div>
      <RadioGroup
        value={value}
        onChange={onChange}
        aria-label={t('userSettingsVisibility.documentsVisibilityHeading')}
      >
        <RadioButton
          value={true}
          label={t('userSettingsVisibility.radioFullLabel')}
          className="mb-2"
        />
        <p className="font-sans text-[12px] text-gray-500 mb-4">
          {t('userSettingsVisibility.documentsFullDescription')}
        </p>
        <RadioButton
          value={false}
          label={t('userSettingsVisibility.radioIndividualLabel')}
          className="mb-2"
        />
        <p className="font-sans text-[12px] text-gray-500">
          {t('userSettingsVisibility.documentsIndividualDescription')}
        </p>
      </RadioGroup>
    </>
  );
}
