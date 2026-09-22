// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Account > Security: change the own password, and enrol in / disable
// multi-factor authentication (TOTP). Secrets and backup codes are shown
// exactly once, in the same bordered "copy this now" box the API-keys tab
// uses. The MFA block stays hidden when the backend does not answer the
// status call, so the tab degrades gracefully on an older API.
import { useCallback, useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';
import { CopyButton } from '../../components/CopyButton';
import PasswordInput from '../../components/input/PasswordInput';
import { Loading } from '../../components/Loading';
import {
  MfaEnrolment,
  MfaStatus,
  SetPasswordProof,
  httpChangePassword,
  httpConfirmMfaEnrolment,
  httpDisableMfa,
  httpGetMfaStatus,
  httpPostForgotPassword,
  httpRegenerateMfaBackupCodes,
  httpSetInitialPassword,
  httpStartMfaEnrolment,
} from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { useAppStore } from '../../store/useAppStore';
import { apiError } from '../../utils/apiError';
import { getUserCredsFromGoogle } from '../../utils/firebase';

const MIN_PASSWORD_LENGTH = 8;

const inputClass =
  'w-full rounded-xl bg-[#F5F7F9] px-[12px] py-[10px] text-[14px] font-sans outline-none focus:ring-2 focus:ring-brand-500';
const primaryButton =
  'py-[10px] px-6 rounded-xl bg-brand-500 text-white hover:bg-brand-darker disabled:opacity-50';
const secondaryButton =
  'py-[10px] px-6 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover disabled:opacity-50';

function BackupCodes({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const { t } = useTranslation();
  const text = codes.join('\n');
  return (
    <div className="mb-8 rounded-2xl border border-brand-500 p-4 max-w-[560px]">
      <div className="font-sans text-regular font-semibold mb-1">{t('userSettingsMfa.backupHeading')}</div>
      <div className="text-red-500 font-sans text-[12px] mb-4">{t('userSettingsMfa.backupWarning')}</div>
      <div className="flex items-start gap-2 bg-[#F5F7F9] rounded-xl px-[12px] py-[12px] mb-4">
        <pre className="flex-1 min-w-0 overflow-x-auto text-[13px] font-mono whitespace-pre">{text}</pre>
        <CopyButton value={text} />
      </div>
      <button type="button" onClick={onDone} className={secondaryButton}>
        {t('userSettingsMfa.doneButton')}
      </button>
    </div>
  );
}

function ResetLink({ available }: { available: boolean }) {
  const { t } = useTranslation();
  const currentUser = useAppStore((s) => s.currentUser);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const email = currentUser?.email || '';
  if (!available || !email) return null;
  const send = async () => {
    setBusy(true);
    try {
      await httpPostForgotPassword(email);
      setSent(true);
      toast.success(t('userSettingsPassword.resetLinkSent').replace('{email}', email));
    } catch (err: unknown) {
      toast.error(apiError(err, t('userSettingsPassword.toastError')).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="text-[#8C8C8C] font-sans text-[12px]">
      {t('userSettingsPassword.forgotCurrent')}{' '}
      <button type="button" disabled={busy || sent} onClick={send} className="text-brand-500 hover:underline disabled:opacity-50 disabled:no-underline">
        {sent ? t('userSettingsPassword.resetLinkSentShort') : t('userSettingsPassword.sendResetLink')}
      </button>
    </div>
  );
}

// Password-less accounts (Google / Facebook / Apple / wallet sign-ups): set a
// first password after a fresh proof of identity. The server verifies the
// provider credential and compares its email with the account; a stolen
// session alone is not enough.
function SetPassword({ status, reload }: { status: MfaStatus; reload: () => Promise<void> }) {
  const { t } = useTranslation();
  const currentApp = useAppStore((s) => s.currentApp);
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const methods = status.setPasswordMethods || ['reauth'];
  const googleAvailable = methods.includes('reauth') && Boolean(currentApp?.signonOptions?.includes('google'));
  const codeAvailable = methods.includes('mfaCode') && status.enabled;
  const mismatch = repeat.length > 0 && next !== repeat;
  const tooShort = next.length > 0 && next.length < MIN_PASSWORD_LENGTH;
  const formOk = next.length >= MIN_PASSWORD_LENGTH && next === repeat && !busy;

  const submit = async (proof: SetPasswordProof) => {
    setBusy(true);
    try {
      const res = await httpSetInitialPassword(next, proof);
      const revoked = res.data?.sessionsRevoked ?? 0;
      toast.success(
        revoked > 0
          ? t('userSettingsPassword.toastSetRevoked').replace('{count}', String(revoked))
          : t('userSettingsPassword.toastSet')
      );
      setNext('');
      setRepeat('');
      setCode('');
      await reload();
    } catch (err: unknown) {
      const { code: c, message } = apiError(err, t('userSettingsPassword.toastError'));
      toast.error(
        c === 'REAUTH_EMAIL_MISMATCH'
          ? t('userSettingsPassword.reauthMismatch')
          : c === 'REAUTH_FAILED'
            ? t('userSettingsPassword.reauthFailed')
            : c === 'MFA_CODE_INVALID'
              ? t('userSettingsMfa.invalidCode')
              : message
      );
    } finally {
      setBusy(false);
    }
  };

  const withGoogle = async () => {
    if (!formOk) return;
    setBusy(true);
    try {
      const creds = await getUserCredsFromGoogle();
      const idToken = creds?.idToken as string | undefined;
      const accessToken = (creds?.credential as { accessToken?: string } | undefined)?.accessToken;
      if (!idToken || !accessToken) {
        toast.error(t('userSettingsPassword.reauthFailed'));
        setBusy(false);
        return;
      }
      await submit({ reauth: { provider: 'google', idToken, accessToken } });
    } catch {
      toast.error(t('userSettingsPassword.reauthFailed'));
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[416px]">
      <div className="text-[#8C8C8C] font-sans text-[12px]">{t('userSettingsPassword.setDescription')}</div>
      <PasswordInput
        fullWidth
        placeholder={t('userSettingsPassword.newPlaceholder')}
        value={next}
        onChange={(e) => setNext(e.target.value)}
        error={tooShort}
        helperText={tooShort ? t('userSettingsPassword.tooShort') : undefined}
        inputProps={{ autoComplete: 'new-password' }}
      />
      <PasswordInput
        fullWidth
        placeholder={t('userSettingsPassword.repeatPlaceholder')}
        value={repeat}
        onChange={(e) => setRepeat(e.target.value)}
        error={mismatch}
        helperText={mismatch ? t('userSettingsPassword.mismatch') : undefined}
        inputProps={{ autoComplete: 'new-password' }}
      />
      {!googleAvailable && !codeAvailable ? (
        <div className="text-[#8C8C8C] font-sans text-[12px]">{t('userSettingsPassword.setNoMethod')}</div>
      ) : (
        <div className="flex flex-col gap-4">
          {googleAvailable && (
            <div>
              <button type="button" disabled={!formOk} onClick={withGoogle} className={primaryButton}>
                {t('userSettingsPassword.setWithGoogle')}
              </button>
            </div>
          )}
          {codeAvailable && (
            <div className="flex flex-col gap-3">
              <div className="text-[#8C8C8C] font-sans text-[12px]">
                {googleAvailable ? t('userSettingsPassword.orWithCode') : t('userSettingsPassword.withCode')}
              </div>
              <input
                className={inputClass}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t('userSettingsMfa.codeOrBackupPlaceholder')}
                autoComplete="one-time-code"
                maxLength={12}
              />
              <div>
                <button type="button" disabled={!formOk || !code} onClick={() => submit({ mfaCode: code })} className={secondaryButton}>
                  {t('userSettingsPassword.setWithCode')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChangePassword({ status, reload }: { status: MfaStatus | null; reload: () => Promise<void> }) {
  const { t } = useTranslation();
  const currentApp = useAppStore((s) => s.currentApp);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false);

  const hasPassword = status ? status.hasPassword : true;
  const mismatch = repeat.length > 0 && next !== repeat;
  const tooShort = next.length > 0 && next.length < MIN_PASSWORD_LENGTH;
  const formOk = next.length >= MIN_PASSWORD_LENGTH && next === repeat && !busy;
  const canSubmit = Boolean(current) && formOk;
  // A user who signs in with Google may not know the password on the account:
  // a fresh Google sign-in for the same email is accepted instead of it.
  const googleInstead =
    Boolean(status?.setPasswordMethods?.includes('reauth')) &&
    Boolean(currentApp?.signonOptions?.includes('google'));

  const changeWithGoogle = async () => {
    if (!formOk) return;
    setBusy(true);
    try {
      const creds = await getUserCredsFromGoogle();
      const idToken = creds?.idToken as string | undefined;
      const accessToken = (creds?.credential as { accessToken?: string } | undefined)?.accessToken;
      if (!idToken || !accessToken) {
        toast.error(t('userSettingsPassword.reauthFailed'));
        return;
      }
      const res = await httpSetInitialPassword(next, { reauth: { provider: 'google', idToken, accessToken } });
      const revoked = res.data?.sessionsRevoked ?? 0;
      toast.success(
        revoked > 0
          ? t('userSettingsPassword.toastSuccessRevoked').replace('{count}', String(revoked))
          : t('userSettingsPassword.toastSuccess')
      );
      setCurrent('');
      setNext('');
      setRepeat('');
      await reload();
    } catch (err: unknown) {
      const { code, message } = apiError(err, t('userSettingsPassword.reauthFailed'));
      toast.error(
        code === 'REAUTH_EMAIL_MISMATCH'
          ? t('userSettingsPassword.reauthMismatch')
          : code === 'REAUTH_FAILED'
            ? t('userSettingsPassword.reauthFailed')
            : message
      );
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    try {
      const res = await httpChangePassword(current, next);
      const revoked = res.data?.sessionsRevoked ?? 0;
      toast.success(
        revoked > 0
          ? t('userSettingsPassword.toastSuccessRevoked').replace('{count}', String(revoked))
          : t('userSettingsPassword.toastSuccess')
      );
      setCurrent('');
      setNext('');
      setRepeat('');
    } catch (err: unknown) {
      const { code, message } = apiError(err, t('userSettingsPassword.toastError'));
      toast.error(code === 'WRONG_CREDENTIALS' ? t('userSettingsPassword.wrongCurrent') : message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-10">
      <p className="font-sans text-regular font-semibold mb-2">
        {hasPassword ? t('userSettingsPassword.heading') : t('userSettingsPassword.setHeading')}
      </p>
      {!hasPassword && status ? (
        <SetPassword status={status} reload={reload} />
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-6 max-w-[416px]" autoComplete="off">
          <div className="text-[#8C8C8C] font-sans text-[12px]">{t('userSettingsPassword.description')}</div>
          <PasswordInput
            fullWidth
            placeholder={t('userSettingsPassword.currentPlaceholder')}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            inputProps={{ autoComplete: 'current-password' }}
          />
          <PasswordInput
            fullWidth
            placeholder={t('userSettingsPassword.newPlaceholder')}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            error={tooShort}
            helperText={tooShort ? t('userSettingsPassword.tooShort') : undefined}
            inputProps={{ autoComplete: 'new-password' }}
          />
          <PasswordInput
            fullWidth
            placeholder={t('userSettingsPassword.repeatPlaceholder')}
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            error={mismatch}
            helperText={mismatch ? t('userSettingsPassword.mismatch') : undefined}
            inputProps={{ autoComplete: 'new-password' }}
          />
          <div className="flex flex-col gap-3">
            <div>
              <button type="submit" disabled={!canSubmit} className={primaryButton}>
                {busy ? t('userSettingsPassword.saving') : t('userSettingsPassword.submit')}
              </button>
            </div>
            {googleInstead && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[#8C8C8C] font-sans text-[12px]">
                <span>{t('userSettingsPassword.forgotCurrent')}</span>
                <button
                  type="button"
                  disabled={!formOk}
                  onClick={changeWithGoogle}
                  className="text-brand-500 hover:underline disabled:opacity-50 disabled:no-underline"
                  title={formOk ? '' : t('userSettingsPassword.fillNewFirst')}
                >
                  {t('userSettingsPassword.changeWithGoogle')}
                </button>
              </div>
            )}
            <ResetLink available={Boolean(status?.passwordResetEmailAvailable)} />
          </div>
        </form>
      )}
    </div>
  );
}

type Stage = 'idle' | 'password' | 'scan' | 'disable' | 'regenerate';

function Mfa({ status, reload }: { status: MfaStatus; reload: () => Promise<void> }) {
  const { t } = useTranslation();
  const currentApp = useAppStore((s) => s.currentApp);
  const [stage, setStage] = useState<Stage>('idle');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [enrolment, setEnrolment] = useState<MfaEnrolment | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setStage('idle');
    setPassword('');
    setCode('');
    setEnrolment(null);
  };

  const start = async () => {
    setBusy(true);
    try {
      const res = await httpStartMfaEnrolment(password);
      setEnrolment(res.data);
      setStage('scan');
      setPassword('');
    } catch (err: unknown) {
      const { code, message } = apiError(err, t('userSettingsMfa.toastError'));
      toast.error(code === 'WRONG_CREDENTIALS' ? t('userSettingsPassword.wrongCurrent') : message);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      const res = await httpConfirmMfaEnrolment(code);
      setBackupCodes(res.data?.backupCodes || []);
      toast.success(t('userSettingsMfa.toastEnabled'));
      reset();
      await reload();
    } catch (err: unknown) {
      const { code: c, message } = apiError(err, t('userSettingsMfa.toastError'));
      toast.error(
        c === 'MFA_CODE_INVALID'
          ? t('userSettingsMfa.invalidCode')
          : c === 'MFA_ENROLMENT_EXPIRED'
            ? t('userSettingsMfa.enrolmentExpired')
            : message
      );
      if (c === 'MFA_ENROLMENT_EXPIRED') reset();
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      await httpDisableMfa(password, code);
      toast.success(t('userSettingsMfa.toastDisabled'));
      setBackupCodes(null);
      reset();
      await reload();
    } catch (err: unknown) {
      const { code: c, message } = apiError(err, t('userSettingsMfa.toastError'));
      toast.error(
        c === 'WRONG_CREDENTIALS'
          ? t('userSettingsPassword.wrongCurrent')
          : c === 'MFA_CODE_INVALID'
            ? t('userSettingsMfa.invalidCode')
            : message
      );
    } finally {
      setBusy(false);
    }
  };

  const regenerate = async () => {
    setBusy(true);
    try {
      const res = await httpRegenerateMfaBackupCodes(code);
      setBackupCodes(res.data?.backupCodes || []);
      toast.success(t('userSettingsMfa.toastRegenerated'));
      reset();
      await reload();
    } catch (err: unknown) {
      const { code, message } = apiError(err, t('userSettingsMfa.toastError'));
      toast.error(code === 'MFA_CODE_INVALID' ? t('userSettingsMfa.invalidCode') : message);
    } finally {
      setBusy(false);
    }
  };

  const codeInput = (placeholderKey: string) => (
    <input
      className={inputClass}
      value={code}
      onChange={(e) => setCode(e.target.value)}
      placeholder={t(placeholderKey)}
      inputMode="text"
      autoComplete="one-time-code"
      maxLength={12}
    />
  );

  const passwordInput = status.hasPassword ? (
    <PasswordInput
      fullWidth
      placeholder={t('userSettingsPassword.currentPlaceholder')}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      inputProps={{ autoComplete: 'current-password' }}
    />
  ) : null;

  const requiredByPolicy = Boolean(currentApp?.requireMfaForAdmins) && !status.enabled;

  return (
    <div className="mb-8">
      <p className="font-sans text-regular font-semibold mb-2">{t('userSettingsMfa.heading')}</p>
      <div className="text-[#8C8C8C] font-sans text-[12px] mb-4">{t('userSettingsMfa.description')}</div>

      {requiredByPolicy && (
        <div className="mb-4 rounded-xl border border-yellow-400 bg-yellow-50 px-4 py-3 text-[13px] font-sans text-yellow-800 max-w-[560px]">
          {t('userSettingsMfa.requiredByPolicy')}
        </div>
      )}

      {backupCodes && <BackupCodes codes={backupCodes} onDone={() => setBackupCodes(null)} />}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-sans mb-4">
        <span className="text-[#8C8C8C]">{t('userSettingsMfa.statusLabel')}</span>
        <span className={status.enabled ? 'text-green-700' : ''}>
          {status.enabled ? t('userSettingsMfa.statusOn') : t('userSettingsMfa.statusOff')}
        </span>
        {status.enabled && (
          <span className="text-[#8C8C8C]">
            {t('userSettingsMfa.backupRemaining').replace('{count}', String(status.backupCodesRemaining))}
          </span>
        )}
      </div>

      {stage === 'idle' && !status.enabled && (
        <button type="button" className={primaryButton} onClick={() => setStage('password')}>
          {t('userSettingsMfa.enableButton')}
        </button>
      )}
      {stage === 'idle' && status.enabled && (
        <div className="flex flex-wrap gap-3">
          <button type="button" className={secondaryButton} onClick={() => setStage('regenerate')}>
            {t('userSettingsMfa.regenerateButton')}
          </button>
          <button
            type="button"
            className="py-[10px] px-6 rounded-xl border border-red-400 text-red-500 hover:bg-red-50"
            onClick={() => setStage('disable')}
          >
            {t('userSettingsMfa.disableButton')}
          </button>
        </div>
      )}

      {stage === 'password' && (
        <div className="flex flex-col gap-6 max-w-[416px]">
          <div className="text-[#8C8C8C] font-sans text-[12px]">
            {status.hasPassword ? t('userSettingsMfa.enterPasswordToStart') : t('userSettingsMfa.startNoPassword')}
          </div>
          {passwordInput}
          <div className="flex gap-3">
            <button type="button" className={primaryButton} disabled={busy || (status.hasPassword && !password)} onClick={start}>
              {t('userSettingsMfa.continueButton')}
            </button>
            <button type="button" className={secondaryButton} disabled={busy} onClick={reset}>
              {t('userSettingsMfa.cancelButton')}
            </button>
          </div>
        </div>
      )}

      {stage === 'scan' && enrolment && (
        <div className="flex flex-col gap-4 max-w-[560px]">
          <div className="text-[#8C8C8C] font-sans text-[12px]">{t('userSettingsMfa.scanInstructions')}</div>
          <div className="bg-white p-3 rounded-xl border border-gray-200 w-fit">
            <QRCode value={enrolment.otpauthUri} size={176} />
          </div>
          <div>
            <div className="text-[#8C8C8C] font-sans text-[12px] mb-1">{t('userSettingsMfa.manualEntry')}</div>
            <div className="flex items-start gap-2 bg-[#F5F7F9] rounded-xl px-[12px] py-[12px]">
              <div className="flex-1 min-w-0 overflow-x-auto text-[13px] font-mono whitespace-nowrap tracking-wider">
                {enrolment.secret.replace(/(.{4})/g, '$1 ').trim()}
              </div>
              <CopyButton value={enrolment.secret} />
            </div>
          </div>
          <div className="text-[#8C8C8C] font-sans text-[12px]">{t('userSettingsMfa.enterFirstCode')}</div>
          <div className="max-w-[416px]">{codeInput('userSettingsMfa.codePlaceholder')}</div>
          <div className="flex gap-3">
            <button type="button" className={primaryButton} disabled={busy || code.replace(/\D/g, '').length !== 6} onClick={confirm}>
              {t('userSettingsMfa.confirmButton')}
            </button>
            <button type="button" className={secondaryButton} disabled={busy} onClick={reset}>
              {t('userSettingsMfa.cancelButton')}
            </button>
          </div>
        </div>
      )}

      {stage === 'disable' && (
        <div className="flex flex-col gap-6 max-w-[416px]">
          <div className="text-[#8C8C8C] font-sans text-[12px]">{t('userSettingsMfa.disableInstructions')}</div>
          {passwordInput}
          {codeInput('userSettingsMfa.codeOrBackupPlaceholder')}
          <div className="flex gap-3">
            <button
              type="button"
              className="py-[10px] px-6 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              disabled={busy || !code || (status.hasPassword && !password)}
              onClick={disable}
            >
              {t('userSettingsMfa.disableConfirmButton')}
            </button>
            <button type="button" className={secondaryButton} disabled={busy} onClick={reset}>
              {t('userSettingsMfa.cancelButton')}
            </button>
          </div>
        </div>
      )}

      {stage === 'regenerate' && (
        <div className="flex flex-col gap-6 max-w-[416px]">
          <div className="text-[#8C8C8C] font-sans text-[12px]">{t('userSettingsMfa.regenerateInstructions')}</div>
          {codeInput('userSettingsMfa.codeOrBackupPlaceholder')}
          <div className="flex gap-3">
            <button type="button" className={primaryButton} disabled={busy || !code} onClick={regenerate}>
              {t('userSettingsMfa.regenerateConfirmButton')}
            </button>
            <button type="button" className={secondaryButton} disabled={busy} onClick={reset}>
              {t('userSettingsMfa.cancelButton')}
            </button>
          </div>
        </div>
      )}
      {busy && <Loading />}
    </div>
  );
}

export function Security() {
  const { t } = useTranslation();
  // null = unknown (older backend, or unreachable): MFA block stays hidden.
  const [status, setStatus] = useState<MfaStatus | null>(null);
  const [checked, setChecked] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await httpGetMfaStatus();
      const body = res.data as (MfaStatus & { data?: MfaStatus }) | undefined;
      const data = body?.data ?? body;
      if (typeof data?.enabled === 'boolean') setStatus(data);
      else setStatus(null);
    } catch {
      setStatus(null);
    } finally {
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="md:ml-4 h-full overflow-auto">
      <ChangePassword status={status} reload={load} />
      {status && <Mfa status={status} reload={load} />}
      {checked && !status && (
        <div className="text-[#8C8C8C] font-sans text-[12px]">{t('userSettingsMfa.unavailable')}</div>
      )}
    </div>
  );
}
