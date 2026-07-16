import { useTranslation } from '../../i18n/useTranslation';

export function BlockedUsers() {
  const { t } = useTranslation();
  return (
    <>
      <div className="subtitle1 mbc-16">
        {t('userSettingsBlockedUsers.title')}
      </div>
    </>
  );
}
