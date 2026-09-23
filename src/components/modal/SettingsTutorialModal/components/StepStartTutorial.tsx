import classNames from 'classnames';
import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStepsStartView } from '../DataTutorial';
import { Step } from '../typeTutorial';
import { useTranslation } from '../../../../i18n/useTranslation';

// Account settings, AI Assistants tab: where the personal MCP URL and the
// per-client connection steps live.
const MCP_TAB_PATH = '/app/account?tab=AI%20Assistants';

export const StepStartTutorial = ({
  onSelect,
  onClose,
}: {
  onSelect: (step: Step) => void;
  // Closes the modal before navigating away to the MCP tab.
  onClose?: () => void;
}): ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

      {/* The fourth path: let an assistant drive the account instead of
          learning these pages. Deliberately below the three cards, as a
          quieter alternative rather than a fourth tile. */}
      {/* Width matches the row of three cards above (3 x 200px + gaps), so
          the modal stays as narrow as it was; theme tokens only, so it reads
          the same on the dark surface. */}
      <div className="mt-8 mx-auto max-w-[680px] rounded-2xl bg-gray-100 p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900">
            {t('stepStartTutorial.mcp.lead')}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {t('stepStartTutorial.mcp.text')}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose?.();
            navigate(MCP_TAB_PATH);
          }}
          className="whitespace-nowrap py-[10px] px-5 rounded-xl bg-brand-500 text-white hover:bg-brand-darker"
        >
          {t('stepStartTutorial.mcp.cta')}
        </button>
      </div>
    </div>
  );
};
