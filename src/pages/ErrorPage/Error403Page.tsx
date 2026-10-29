import images from '../../assets/error/403.png';
import { ErrorContainer } from '../../components/Error/ErrorContainer';
import { useTranslation } from '../../i18n/useTranslation';
import { useAppStore } from '../../store/useAppStore';

interface Error403PageProps {
  navigateUrl?: string;
  forApp?: boolean;
}

export const Error403Page = ({ navigateUrl, forApp = false }: Error403PageProps) => {
  const { t } = useTranslation();
  const email = useAppStore((s) => s.currentUser?.email);
  return (
    <ErrorContainer
      status={t('error403.status')}
      title={forApp ? t('error403.appTitle') : t('error403.title')}
      description={forApp ? t('error403.appDescription') : t('error403.description')}
      image={images}
      navigateUrl={navigateUrl}
    >
      {forApp && (
        <div className="mb-8 max-w-md rounded-2xl bg-gray-100 p-4 text-left text-sm">
          <div className="font-semibold mb-2">{t('error403.appStepsTitle')}</div>
          <ol className="list-decimal pl-5 space-y-1 text-gray-700">
            <li>{t('error403.appStep1')}</li>
            <li>{t('error403.appStep2')}</li>
            <li>{t('error403.appStep3')}</li>
          </ol>
          {email && (
            <div className="mt-3 text-gray-600">
              {t('error403.appYourAccount')} <span className="font-semibold text-gray-900">{email}</span>
            </div>
          )}
        </div>
      )}
    </ErrorContainer>
  );
};
