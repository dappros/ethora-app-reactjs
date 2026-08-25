import { Checkbox, Field, Label } from '@headlessui/react';
import { IconCheckbox } from '../../components/Icons/IconCheckbox';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  // The App field is negative (`userRegistrationDisabled`); this component is
  // the ONE place in the codebase allowed to invert it, because the checkbox
  // is phrased positively. Everything else does a plain truthy check.
  userRegistrationDisabled: boolean;
  setUserRegistrationDisabled: (disabled: boolean) => void;
  enableEmail: boolean;
  setEnableEmail: (on: boolean) => void;
  enableGoogle: boolean;
  setEnableGoogle: (on: boolean) => void;
  enableApple: boolean;
  setEnableApple: (on: boolean) => void;
  enableFacebook: boolean;
  setEnableFacebook: (on: boolean) => void;
  enableMetamask: boolean;
  setEnableMetamask: (on: boolean) => void;
  firebaseWebConfigString: string;
}

export function SignonOptions({
  userRegistrationDisabled,
  setUserRegistrationDisabled,
  enableEmail,
  setEnableEmail,
  enableGoogle,
  setEnableGoogle,
  enableApple,
  setEnableApple,
  enableFacebook,
  setEnableFacebook,
  enableMetamask,
  setEnableMetamask,
  firebaseWebConfigString,
}: Props) {
  const { t } = useTranslation();
  const isEmptyFirebaseConfig = !firebaseWebConfigString || firebaseWebConfigString.trim() === '';

  const WarningMessage = ({ text }: { text: string }) => {
    if (!isEmptyFirebaseConfig) {
      return <p className="font-sans text-[12px] text-gray-500 mb-4">{text}</p>;
    }

    return (
      <div className="flex items-start gap-2 mb-4">
        <WarningAmberIcon 
          sx={{ 
            fontSize: 16, 
            color: '#f59e0b',
            marginTop: '2px',
            flexShrink: 0
          }} 
        />
        <p className="font-sans text-[14px] text-yellow-600 font-medium">
          {text}
        </p>
      </div>
    );
  };

  return (
    <div className="">
      <p className="font-sans text-sm mb-8">
        {t('appSettingsSignonOptions.description')}
      </p>
      <p className="font-sans text-[24px] font-medium mb-2">
        {t('appSettingsSignonOptions.userRegistrationHeading')}
      </p>
      <p className="font-sans text-[12px] text-gray-500 mb-4">
        {t('appSettingsSignonOptions.userRegistrationDescription')}
      </p>
      <Field className="flex items-center cursor-pointer mb-2">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={!userRegistrationDisabled}
          onChange={(allowed: boolean) => setUserRegistrationDisabled(!allowed)}
        >
          <IconCheckbox className="hidden group-data-[checked]:block" />
        </Checkbox>
        <Label className="cursor-pointer font-sans text-sm">
          {t('appSettingsSignonOptions.allowUserRegistrationLabel')}
        </Label>
      </Field>
      {userRegistrationDisabled ? (
        <div className="flex items-start gap-2 mb-8">
          <WarningAmberIcon
            sx={{
              fontSize: 16,
              color: '#f59e0b',
              marginTop: '2px',
              flexShrink: 0,
            }}
          />
          <p className="font-sans text-[14px] text-yellow-600 font-medium">
            {t('appSettingsSignonOptions.registrationClosedWarning')}
          </p>
        </div>
      ) : (
        <p className="font-sans text-[12px] text-gray-500 mb-8">
          {t('appSettingsSignonOptions.registrationOpenHint')}
        </p>
      )}
      <p className="font-sans text-[24px] font-medium mb-2">
        {t('appSettingsSignonOptions.standardLoginHeading')}
      </p>
      <p className="font-sans text-[12px] text-gray-500 mb-4">
        {t('appSettingsSignonOptions.standardLoginDescription')}
      </p>
      {/* checkbox */}
      <Field className="flex items-center cursor-pointer mb-8">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={enableEmail}
          onChange={setEnableEmail}
        >
          <IconCheckbox className="hidden group-data-[checked]:block" />
        </Checkbox>
        <Label className="cursor-pointer font-sans text-sm">
          {t('appSettingsSignonOptions.emailPasswordLabel')}
        </Label>
      </Field>
      <p className="font-sans text-[24px] font-medium mb-2">
        {t('appSettingsSignonOptions.socialSignOnHeading')}
      </p>
      <p className="font-sans text-[12px] text-gray-500 mb-4">
        {t('appSettingsSignonOptions.socialSignOnDescription')}
      </p>
      <Field className="flex items-center cursor-pointer mb-2">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={enableGoogle}
          onChange={setEnableGoogle}
        >
          <IconCheckbox className="hidden group-data-[checked]:block" />
        </Checkbox>
        <Label className="cursor-pointer font-sans text-sm">
          {t('appSettingsSignonOptions.googleLabel')}
        </Label>
      </Field>
      <WarningMessage text={t('appSettingsSignonOptions.firebaseWarning')} />
      <Field className="flex items-center cursor-pointer mb-2">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={enableApple}
          onChange={setEnableApple}
        >
          <IconCheckbox className="hidden group-data-[checked]:block" />
        </Checkbox>
        <Label className="cursor-pointer font-sans text-sm">
          {t('appSettingsSignonOptions.appleLabel')}
        </Label>
      </Field>
      <WarningMessage text={t('appSettingsSignonOptions.firebaseWarning')} />
      <Field className="flex items-center cursor-pointer mb-2">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={enableFacebook}
          onChange={setEnableFacebook}
        >
          <IconCheckbox className="hidden group-data-[checked]:block" />
        </Checkbox>
        <Label className="cursor-pointer font-sans text-sm">
          {t('appSettingsSignonOptions.facebookLabel')}
        </Label>
      </Field>
      <WarningMessage text={t('appSettingsSignonOptions.firebaseWarning')} />
      <Field className="flex items-center cursor-pointer mb-2">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={enableMetamask}
          onChange={setEnableMetamask}
        >
          <IconCheckbox className="hidden group-data-[checked]:block" />
        </Checkbox>
        <Label className="cursor-pointer font-sans text-sm">
          {t('appSettingsSignonOptions.metamaskLabel')}
        </Label>
      </Field>
      <p className="font-sans text-[12px] text-gray-500 mb-8">
        {t('appSettingsSignonOptions.web3Description')}
      </p>
      <p className="font-sans text-[24px] font-medium mb-2">
        {t('appSettingsSignonOptions.customBackendHeading')}
      </p>
      <p className="font-sans text-[12px] text-gray-500 mb-4">
        {t('appSettingsSignonOptions.customBackendDescription')}
      </p>
      <Field className="flex items-center cursor-pointer mb-2" disabled>
        <Checkbox className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 data-[disabled]:border-gray-300 flex justify-center items-center"></Checkbox>
        <Label className="cursor-pointer font-sans text-sm data-[disabled]:text-gray-300">
          {t('appSettingsSignonOptions.apiIntegrationLabel')}
        </Label>
      </Field>
    </div>
  );
}
