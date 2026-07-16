import classNames from 'classnames';
import { ReactElement } from 'react';
import { getStepsStartView } from '../DataTutorial';
import { Step } from '../typeTutorial';
import { useTranslation } from '../../../../i18n/useTranslation';

export const StepStartTutorial = ({
  onSelect,
}: {
  onSelect: (step: Step) => void;
}): ReactElement => {
  const { t } = useTranslation();
  const stepsStartView = getStepsStartView(t);

  return (
    <div>
      <p className='text-2xl font-bold pt-4 pb-2'>
        {t('stepStartTutorial.heading')}
      </p>
      <p className='text-sm text-gray-500 pb-4'>
        {t('stepStartTutorial.subheading')}
      </p>
      <div className='flex md:flex-row flex-col gap-6 items-center justify-center'>
      {stepsStartView.map(
        ({ step, title, description, icon }, index) => (
          <div className="flex md:flex-col flex-row md:gap-4 gap-8 items-center justify-center">
            <button
              key={`${title}-${index}`}
              onClick={() => onSelect(step)}
              className={classNames(
                'group relative overflow-hidden rounded-lg border-2 transition-all duration-300 p-0',
                'hover:scale-105 hover:shadow-lg'
              )}
            >
              <img 
                src={icon} 
                alt={title} 
                className={classNames(
                  'block w-[200px] h-[200px] object-cover rounded-lg border-2 border-gray-200',
                  'transition-all duration-300'
                )} 
              />
              
              {/* <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col justify-between p-4">
                <div className="text-white font-semibold text-lg">
                  {title}
                </div>
                
                <div className="text-white text-sm">
                  {description}
                </div>
              </div> */}
            </button>

            <div className="w-[200px]">
              <div className="text-black font-semibold text-lg">
                {title}
              </div>
              
              <div className="text-black text-sm">
                {description}
              </div>
            </div>
          </div>
        )
      )}
      </div>
    </div>
  );
};
