import { toBaseLanguage } from '../constants/languageOptionsConstants';
import { translations } from '../i18n/translations';
import { useAppStore } from '../store/useAppStore';

// A request refused because the account has no access record on its own App
// (API code ACCOUNT_INCOMPLETE): a sign-up interrupted by a chat server outage
// left it incomplete. Signing in again completes the account (API
// accountRepair.service), so the message says that instead of the raw
// "Not found userAcl".
export function isAccountIncompleteError(e: unknown): boolean {
  const data = (e as { response?: { data?: { error?: string; code?: string } } })?.response?.data;
  return data?.code === 'ACCOUNT_INCOMPLETE' || data?.error === 'Not found userAcl';
}

/** The readable message in the current UI language (usable outside React). */
export function accountIncompleteText(): string {
  const language = toBaseLanguage(useAppStore.getState().uiLanguage);
  const key = 'startProject.accountIncomplete';
  return translations[language]?.[key] ?? translations.en[key] ?? key;
}

/**
 * For the API client's response interceptor: every screen that shows the
 * API's `error` text (App chats, default rooms, App settings, ...) shows the
 * readable message for ACCOUNT_INCOMPLETE without a change of its own.
 */
export function rewriteAccountIncompleteError(error: unknown): void {
  const data = (error as { response?: { data?: { error?: string; code?: string } } })?.response?.data;
  if (data && typeof data === 'object' && data.code === 'ACCOUNT_INCOMPLETE') data.error = accountIncompleteText();
}
