import images from '../../assets/error/404.png';
import { ErrorContainer } from '../../components/Error/ErrorContainer';
import { useTranslation } from '../../i18n/useTranslation';

interface Error404PageProps {
  navigateUrl?: string;
}

export const Error404Page = ({ navigateUrl }: Error404PageProps) => {
  const { t } = useTranslation();
  return (
    <ErrorContainer
      status={t('error404.status')}
      title={t('error404.title')}
      description={t('error404.description')}
      image={images}
      navigateUrl={navigateUrl}
    />
  );
};
