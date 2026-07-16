import images from '../../assets/error/403.png';
import { ErrorContainer } from '../../components/Error/ErrorContainer';
import { useTranslation } from '../../i18n/useTranslation';

export const Error403Page = () => {
  const { t } = useTranslation();
  return (
    <ErrorContainer
      status={t('error403.status')}
      title={t('error403.title')}
      description={t('error403.description')}
      image={images}
    />
  );
};
