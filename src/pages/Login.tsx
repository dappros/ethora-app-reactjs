import { useTranslation } from '../i18n/useTranslation';

export default function Login() {
  const { t } = useTranslation();
  return <div>{t('authLoginPage.title')}</div>;
}
