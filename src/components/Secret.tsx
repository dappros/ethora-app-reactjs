import { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';

interface Props {
  value: string;
  className: string;
}

export function Secret({ value, className }: Props) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  return (
    <div className={className}>
      {!show && (
        <a
          className="text-brand-500 underline cursor-pointer"
          onClick={() => setShow(true)}
        >
          {t('secret.clickToReveal')}
        </a>
      )}
      {show && (
        <div>
          <span className="mr-2">{value}</span>{' '}
          <a
            className="text-brand-500 underline cursor-pointer"
            onClick={() => setShow(false)}
          >
            {t('secret.hide')}
          </a>
        </div>
      )}
    </div>
  );
}
