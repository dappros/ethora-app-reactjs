import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { actionSetChatLanguage, actionSetUiLanguage } from '../../actions';
import {
  UiLocale,
  resolveAvailableLanguages,
  resolveTranslateLanguages,
} from '../../constants/languageOptionsConstants';
import { useTranslation } from '../../i18n/useTranslation';
import { useAppStore } from '../../store/useAppStore';
import { LanguageModal } from '../modal/LanguageModal';

// The interface-language and chat-language pickers. Shared by the Profile
// page and the Account > Appearance tab, which show the same two settings.
export function LanguageSettings() {
  const { t } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showChatLanguageModal, setShowChatLanguageModal] = useState(false);
  // App-wide UI language (see store/appStore.ts's uiLanguage /
  // doSetUiLanguage). Reading it from the store - not local state - means
  // every component using useTranslation() re-renders together when it
  // changes here.
  const uiLanguage = useAppStore((s) => s.uiLanguage);
  // Languages the interface works in, from get-config's translateLanguages
  // narrowed to the bundled catalogue. Falls back to the full catalogue if the
  // server sent nothing usable - see constants/languageOptionsConstants.ts.
  const availableLanguages = useAppStore((s) => s.availableLanguages);
  const languageOptions = resolveAvailableLanguages(availableLanguages);
  const currentLanguageName =
    languageOptions.find((l) => l.id === uiLanguage)?.name ?? uiLanguage;
  // Null means the user never picked a chat language. The backend then
  // translates into their app language, so that is what the row shows -
  // labelled as following the interface, not as an independent choice.
  const chatLanguage = useAppStore((s) => s.chatLanguage);
  // What the install's translation server can actually translate into
  // (get-config `translateLanguages`). This - not the interface catalogue -
  // is what the chat picker offers: translating messages INTO a language does
  // not require the UI to render in it.
  const translateLanguages = useAppStore((s) => s.translateLanguages);
  const translateOptions = useMemo(
    () => resolveTranslateLanguages(translateLanguages, uiLanguage),
    [translateLanguages, uiLanguage]
  );
  const effectiveChatLanguage = chatLanguage ?? uiLanguage;
  const currentChatLanguageName =
    translateOptions.find((l) => l.id === effectiveChatLanguage)?.name ??
    effectiveChatLanguage;
  // The stored choice can fall outside the offered set - the operator narrows
  // the translation server's languages, or the user's app language is one it
  // has no model for. Say so rather than showing a value that silently will
  // not translate.
  const chatLanguageUnsupported =
    translateOptions.length > 0 &&
    !translateOptions.some((l) => l.id === effectiveChatLanguage);

  // The switch itself is local and instant; persisting it to the profile is
  // the part that can fail. On failure the UI stays on the newly-picked
  // language (it's still cached locally) and we say the save didn't stick,
  // rather than yanking the interface back to the old one.
  const onChangeUiLanguage = async (code: UiLocale) => {
    setShowLanguageModal(false);
    try {
      await actionSetUiLanguage(code);
      toast.success(t('language.savedToast'));
    } catch (e) {
      console.error('[LanguageSettings] failed to save language to profile', e);
      toast.error(t('language.saveFailedToast'));
    }
  };

  // Unlike the UI language there is nothing applied locally first, so a failed
  // write leaves the row on its previous value and the toast is the whole
  // story.
  const onChangeChatLanguage = async (code: string) => {
    setShowChatLanguageModal(false);
    try {
      await actionSetChatLanguage(code);
      toast.success(t('language.savedToast'));
    } catch (e) {
      console.error('[LanguageSettings] failed to save chat language to profile', e);
      toast.error(t('language.saveFailedToast'));
    }
  };

  // Hidden entirely on a single-language install: a picker with nothing to
  // pick reads as a broken control, not as a setting.
  if (languageOptions.length <= 1) return null;

  return (
    <>
      <p className="text-gray-500 font-sans text-[14px] mb-2">
        {t('profile.language')}
      </p>
      <button
        onClick={() => setShowLanguageModal(true)}
        className="w-full max-w-[416px] text-left rounded-xl border border-gray-300 px-3 py-2 bg-white hover:bg-brand-hover"
      >
        {currentLanguageName}
      </button>
      {/* Hidden entirely when the install has no translation server
          (get-config reports translateLanguages: []): a picker whose choice
          cannot take effect is worse than no picker. */}
      {translateOptions.length > 0 && (
        <>
          <p className="text-gray-500 font-sans text-[14px] mt-4 mb-2">
            {t('profile.chatLanguage')}
          </p>
          <button
            onClick={() => setShowChatLanguageModal(true)}
            className="w-full max-w-[416px] text-left rounded-xl border border-gray-300 px-3 py-2 bg-white hover:bg-brand-hover"
          >
            {currentChatLanguageName}
          </button>
          <p className="text-gray-500 font-sans text-[12px] mt-2">
            {chatLanguage === null
              ? t('profile.chatLanguageFollowingApp')
              : t('profile.chatLanguageHint')}
          </p>
          {chatLanguageUnsupported && (
            <p className="text-red-500 font-sans text-[12px] mt-1">
              {t('profile.chatLanguageUnsupported')}
            </p>
          )}
        </>
      )}

      {showLanguageModal && (
        <LanguageModal
          value={uiLanguage}
          options={languageOptions}
          onSelect={onChangeUiLanguage}
          onClose={() => setShowLanguageModal(false)}
          title={t('profile.language')}
        />
      )}
      {showChatLanguageModal && (
        <LanguageModal
          value={effectiveChatLanguage}
          options={translateOptions}
          onSelect={onChangeChatLanguage}
          onClose={() => setShowChatLanguageModal(false)}
          title={t('profile.chatLanguage')}
        />
      )}
    </>
  );
}
