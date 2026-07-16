import { ReactElement, RefObject } from 'react';
import { useTranslation } from '../../i18n/useTranslation';

interface RagProps {
  ragRef: RefObject<HTMLDivElement>;
}

export const Rag = ({ ragRef }: RagProps): ReactElement => {
  const { t } = useTranslation();
  return (
    <>
      <div
        ref={ragRef}
        className="font-semibold font-sans text-[16px] pb-4 pt-8 text-blue-600"
      >
        {t('aiWidgetRag.title')}
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1 text-blue-600">
        {t('aiWidgetRag.paragraph1')}
      </p>
      <p className="font-sans text-sm pb-4 flex items-center gap-1 text-blue-600">
        {t('aiWidgetRag.paragraph2')}
      </p>
      <p className="font-sans text-sm pb-4 text-blue-600 items-center gap-1 mb-8 inline-block">
        {t('aiWidgetRag.paragraph3Prefix')}{' '}
        <strong>{t('aiWidgetRag.paragraph3Bold')}</strong>{' '}
        {t('aiWidgetRag.paragraph3Suffix')}
      </p>
    </>
  );
};
