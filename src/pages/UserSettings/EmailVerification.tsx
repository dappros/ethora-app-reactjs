// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved

// Optional email verification, shown as a quiet state line next to the
// account's address.
//
// Verification is deliberately NOT required to use Ethora: making it mandatory
// cost signups, so nothing here gates access. There is no banner, no modal and
// no interstitial - the user starts it or ignores it. The only reason it is
// surfaced at all is that some assistant connectors (ChatGPT) will not accept
// an account whose address is unverified, so a person connecting one needs a
// way to opt in.
//
// The whole block renders nothing when the backend does not report a
// verification state, so this can ship before the endpoints do.
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  httpGetUserMeV2,
  httpSendUserEmailVerification,
  UserEmailVerificationSent,
} from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { useAppStore } from '../../store/useAppStore';

// Guard against a user hammering the link; the backend rate-limits too.
const RESEND_COOLDOWN_SECONDS = 60;

export function EmailVerification() {
  const { t } = useTranslation();
  const currentUser = useAppStore((s) => s.currentUser);
  // null = unknown (endpoint missing or unreachable), which hides the block.
  const [verified, setVerified] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await httpGetUserMeV2();
      const data = res.data?.data ?? res.data;
      const state = (data as { emailVerified?: boolean })?.emailVerified;
      if (typeof state !== 'boolean') {
        // Backend predates the field: stay silent rather than guess.
        setVerified(null);
        return;
      }
      setVerified(state);
      const addr = (data as { email?: string })?.email;
      if (addr) setEmail(addr);
    } catch {
      setVerified(null);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const onSend = async () => {
    setSending(true);
    try {
      const res = await httpSendUserEmailVerification();
      const data = res.data?.data ?? res.data;
      const payload = data as Partial<UserEmailVerificationSent>;
      if (payload?.email) setEmail(payload.email);
      if (payload?.alreadyVerified) {
        // Nothing went wrong - the address was verified in the meantime.
        setVerified(true);
        setSent(false);
        return;
      }
      setSent(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      toast.error(t('userSettingsEmail.toastError'));
    } finally {
      setSending(false);
    }
  };

  if (verified === null) return null;

  const address = email || currentUser?.email || '';

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-sans">
        <span className="text-gray-500">{t('userSettingsEmail.label')}</span>
        {address && <span className="break-all">{address}</span>}
        {verified ? (
          <span className="text-gray-500">{t('userSettingsEmail.verified')}</span>
        ) : (
          <>
            <span className="text-gray-500">
              {t('userSettingsEmail.notVerified')}
            </span>
            {!sent && (
              <button
                type="button"
                disabled={sending}
                onClick={onSend}
                className="text-brand-500 hover:underline disabled:opacity-50"
              >
                {sending
                  ? t('userSettingsEmail.sending')
                  : t('userSettingsEmail.verifyButton')}
              </button>
            )}
          </>
        )}
      </div>

      {!verified && sent && (
        <div className="mt-2 text-gray-500 font-sans text-[12px]">
          {t('userSettingsEmail.sentMessage').replace('{email}', address)}{' '}
          <button
            type="button"
            disabled={sending || cooldown > 0}
            onClick={onSend}
            className="text-brand-500 hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {cooldown > 0
              ? t('userSettingsEmail.resendIn').replace(
                  '{seconds}',
                  String(cooldown)
                )
              : t('userSettingsEmail.resendButton')}
          </button>
        </div>
      )}

      {!verified && !sent && (
        <div className="mt-1 text-gray-500 font-sans text-[12px]">
          {t('userSettingsEmail.optionalNote')}
        </div>
      )}
    </div>
  );
}
