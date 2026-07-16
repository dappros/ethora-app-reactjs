import images from '../../assets/error/429.png';
import { ErrorContainer } from '../../components/Error/ErrorContainer';
import { useTranslation } from '../../i18n/useTranslation';

export const Error429Page = () => {
  const { t } = useTranslation();
  return (
    <ErrorContainer
      status={t('error429.status')}
      title={t('error429.title')}
      description={t('error429.description')}
      image={images}
    />
  );
};
