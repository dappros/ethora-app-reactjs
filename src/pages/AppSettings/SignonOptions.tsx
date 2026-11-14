import { Checkbox, Field, Label } from '@headlessui/react';
import { IconCheckbox } from '../../components/Icons/IconCheckbox';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import classNames from 'classnames';
import { useTranslation } from '../../i18n/useTranslation';
import { isValidSupportContact, parseBlockedDomains } from '../../utils/suspension';

interface Props {
  // The App field is negative (`userRegistrationDisabled`); this component is
  // the ONE place in the codebase allowed to invert it, because the checkbox
  // is phrased positively. Everything else does a plain truthy check.
  userRegistrationDisabled: boolean;
  setUserRegistrationDisabled: (disabled: boolean) => void;
  requireMfaForAdmins: boolean;
  setRequireMfaForAdmins: (on: boolean) => void;
  // Account suspension: contact shown to suspended users, and the blocked
  // sign-up email domains (raw textarea text, one pattern per line; parsed
  // and validated again on save).
  supportContact: string;
  setSupportContact: (value: string) => void;
  signupBlockedDomainsText: string;
  setSignupBlockedDomainsText: (value: string) => void;
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
  requireMfaForAdmins,
  setRequireMfaForAdmins,
  supportContact,
  setSupportContact,
  signupBlockedDomainsText,
  setSignupBlockedDomainsText,
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
  const supportContactInvalid = !isValidSupportContact(supportContact);
  const invalidBlockedDomains = parseBlockedDomains(signupBlockedDomainsText).invalid;

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
        <p className="font-sans text-[14px] text-yellow-600 dark:text-yellow-400 font-medium">
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
          <p className="font-sans text-[14px] text-yellow-600 dark:text-yellow-400 font-medium">
            {t('appSettingsSignonOptions.registrationClosedWarning')}
          </p>
        </div>
      ) : (
        <p className="font-sans text-[12px] text-gray-500 mb-8">
          {t('appSettingsSignonOptions.registrationOpenHint')}
        </p>
      )}
      <p className="font-sans text-[24px] font-medium mb-2">
        {t('userSuspension.settings.blockedHeading')}
      </p>
      <p className="font-sans text-[12px] text-gray-500 mb-1">
        {t('userSuspension.settings.blockedDescription')}
      </p>
      <p className="font-sans text-[12px] text-gray-500 mb-4">
        {t('userSuspension.settings.blockedExamples')}
      </p>
      <textarea
        aria-label={t('userSuspension.settings.blockedHeading')}
        className={classNames(
          'rounded-2xl bg-gray-100 py-3 px-6 w-full max-w-[520px] min-h-[96px] outline-none font-mono text-sm',
          invalidBlockedDomains.length ? 'border border-red-500' : ''
        )}
        placeholder={'*.sch.uk\n*.k12.*.us\nexample.org'}
        spellCheck={false}
        value={signupBlockedDomainsText}
        onChange={(e) => setSignupBlockedDomainsText(e.target.value)}
      />
      {invalidBlockedDomains.length > 0 ? (
        <p className="font-sans text-[12px] text-red-600 dark:text-red-400 mt-1 mb-8">
          {t('userSuspension.settings.blockedInvalid').replace('{lines}', invalidBlockedDomains.join(', '))}
        </p>
      ) : (
        <div className="mb-8" />
      )}
      <p className="font-sans text-[24px] font-medium mb-2">
        {t('appSettingsSignonOptions.mfaHeading')}
      </p>
      <p className="font-sans text-[12px] text-gray-500 mb-4">
        {t('appSettingsSignonOptions.mfaDescription')}
      </p>
      <Field className="flex items-center cursor-pointer mb-2">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={requireMfaForAdmins}
          onChange={setRequireMfaForAdmins}
        >
          <IconCheckbox className="hidden group-data-[checked]:block" />
        </Checkbox>
        <Label className="cursor-pointer font-sans text-sm">
          {t('appSettingsSignonOptions.requireMfaForAdminsLabel')}
        </Label>
      </Field>
      <p className="font-sans text-[12px] text-gray-500 mb-8">
        {t('appSettingsSignonOptions.requireMfaForAdminsHint')}
      </p>
      <p className="font-sans text-[24px] font-medium mb-2">
        {t('userSuspension.settings.supportHeading')}
      </p>
      <p className="font-sans text-[12px] text-gray-500 mb-4">
        {t('userSuspension.settings.supportDescription')}
      </p>
      <input
        type="text"
        aria-label={t('userSuspension.settings.supportHeading')}
        className={classNames(
          'rounded-2xl bg-gray-100 py-3 px-6 w-full max-w-[520px] outline-none font-sans text-sm',
          supportContactInvalid ? 'border border-red-500' : ''
        )}
        placeholder={t('userSuspension.settings.supportPlaceholder')}
        value={supportContact}
        onChange={(e) => setSupportContact(e.target.value)}
      />
      {supportContactInvalid ? (
        <p className="font-sans text-[12px] text-red-600 dark:text-red-400 mt-1 mb-8">
          {t('userSuspension.settings.supportInvalid')}
        </p>
      ) : (
        <div className="mb-8" />
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
        <Label className="cursor-pointer font-sans text-sm data-[disabled]:text-gray-300 dark:data-[disabled]:text-gray-500">
          {t('appSettingsSignonOptions.apiIntegrationLabel')}
        </Label>
      </Field>
    </div>
  );
}
