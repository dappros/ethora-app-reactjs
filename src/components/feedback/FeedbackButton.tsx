import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation';

import './style.css';

interface FeedbackButtonProps {
  onClick: (value: boolean) => void;
}

export const FeedbackButton = ({ onClick }: FeedbackButtonProps) => {
  const { t } = useTranslation();
  const [wiggle, setWiggle] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!hovered) {
        setWiggle(true);
        setTimeout(() => setWiggle(false), 800);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [hovered]);

  return (
    <>
      <div
        className="hidden md:block feedback-wrapper"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className={classNames('feedback-inner', wiggle && 'wiggleX')}>
          <button
            className="bg-[#f38518] hover:bg-brand-500 text-white px-4 py-2 rounded-tl-lg rounded-tr-lg shadow"
            onClick={() => onClick(true)}
          >
            {t('feedbackButton.support')}
          </button>
        </div>
      </div>

      <button
        className="md:hidden fixed bottom-4 right-4 z-50 bg-[#f38518] hover:bg-brand-500 text-white w-12 h-12 flex items-center justify-center rounded-full shadow transition-all duration-300 ease-in-out text-sm font-bold"
        onClick={() => onClick(true)}
      >
        {t('feedbackButton.mobileAbbrev')}
      </button>
    </>
  );
};
