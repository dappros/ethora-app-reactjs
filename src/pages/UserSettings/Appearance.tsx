import { LanguageSettings } from '../../components/settings/LanguageSettings';
import { useHasLanguageSettings } from '../../components/settings/useHasLanguageSettings';
import { ThemeSettings } from '../../components/settings/ThemeSettings';
import { useTranslation } from '../../i18n/useTranslation';

export function Appearance() {
  const { t } = useTranslation();
  const hasLanguageSettings = useHasLanguageSettings();

  return (
    <div className="md:ml-4">
      <div className="font-sans font-semibold text-[16px] mb-2">
        {t('appearance.themeHeading')}
      </div>
      <p className="text-gray-500 font-sans text-[12px] mb-4">
        {t('appearance.themeDescription')}
      </p>
      <ThemeSettings />
      {hasLanguageSettings && (
        <>
          <div className="font-sans font-semibold text-[16px] mt-8 mb-4">
            {t('appearance.languageHeading')}
          </div>
          <LanguageSettings />
        </>
      )}
    </div>
  );
}
