// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Blocking "Account suspended" card, shown in place of the sign-in form when
// a login answers 403 USER_SUSPENDED and on /account-suspended after a live
// session was ended for the same reason. Reason (localised from reasonCode),
// the admin's optional message, "until <date>" only for a temporary
// suspension, and the support contact (mailto: for an address, else a link).
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { DateTime } from 'luxon';
import { useTranslation } from '../i18n/useTranslation';
import { ModelSuspensionNotice } from '../models';
import { useAppStore } from '../store/useAppStore';
import { suspensionReasonKey, supportContactHref } from '../utils/suspension';

interface Props {
  notice: ModelSuspensionNotice | null;
  onBack?: () => void;
}

function formatDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return '';
  const d = DateTime.fromISO(iso);
  return d.isValid ? d.setLocale(locale).toLocaleString(DateTime.DATE_FULL) : '';
}

export function SuspendedAccountPanel({ notice, onBack }: Props) {
  const { t, language } = useTranslation();
  const appSupportContact = useAppStore((s) => s.currentApp?.supportContact);
  const contact = String(notice?.supportContact || appSupportContact || '').trim();
  const href = supportContactHref(contact);
  const until = formatDate(notice?.until, language);
  const message = String(notice?.message || '').trim();

  return (
    <div
      role="alert"
      data-testid="account-suspended"
      className="w-full max-w-[600px] rounded-3xl bg-white text-gray-950 p-6 md:px-10 md:py-8 shadow-lg flex flex-col gap-4"
    >
      <div className="flex items-center gap-3">
        <BlockOutlinedIcon sx={{ color: 'rgb(var(--c-gray-500))' }} />
        <h1 className="font-varela text-[24px] m-0">{t('userSuspension.screen.title')}</h1>
      </div>
      <p className="font-sans text-sm text-gray-700">{t('userSuspension.screen.body')}</p>
      {notice?.reasonCode && (
        <p className="font-sans text-sm">
          <span className="font-semibold">{t('userSuspension.screen.reasonLabel')}</span>{' '}
          {t(suspensionReasonKey(notice.reasonCode))}
        </p>
      )}
      {until && (
        <p className="font-sans text-sm">{t('userSuspension.screen.until').replace('{date}', until)}</p>
      )}
      {message && (
        <div className="font-sans text-sm">
          <div className="font-semibold mb-1">{t('userSuspension.screen.messageLabel')}</div>
          <div className="rounded-xl bg-gray-100 px-4 py-3 whitespace-pre-line break-words">{message}</div>
        </div>
      )}
      {contact && (
        <p className="font-sans text-sm">
          {t('userSuspension.screen.contact')}{' '}
          {href ? (
            <a
              href={href}
              className="text-brand-500 underline break-all"
              {...(href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            >
              {contact}
            </a>
          ) : (
            <span className="break-all">{contact}</span>
          )}
        </p>
      )}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-2 w-full py-3 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover font-varela"
        >
          {t('userSuspension.screen.back')}
        </button>
      )}
    </div>
  );
}
