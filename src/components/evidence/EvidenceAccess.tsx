// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Evidence review is for server superadmins with write access
// (isSuperAdmin.write, see hooks.ts). The nav entry is hidden for anyone
// else; a direct visit, or a 403 from the API, gets this notice.
import { useTranslation } from '../../i18n/useTranslation';

export function EvidenceNotAllowed() {
  const { t } = useTranslation();
  return (
    <div className="h-full overflow-y-auto">
      <div className="font-varela text-[24px] mb-2">{t('evidence.title')}</div>
      <div role="alert" className="max-w-[720px] rounded-xl border border-gray-200 bg-gray-50 p-4 font-sans text-sm">
        <div className="font-semibold mb-1">{t('evidence.notAllowed.title')}</div>
        <p className="text-gray-700">{t('evidence.notAllowed.body')}</p>
      </div>
    </div>
  );
}

// "Access to evidence is logged." shown above the list and every case.
export function EvidenceLoggedNotice() {
  const { t } = useTranslation();
  return (
    <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 font-sans text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
      {t('evidence.logged')}
    </p>
  );
}
