import classNames from 'classnames';
import { ReactElement } from 'react';
import { stepsStartView } from '../DataTutorial';
import { Step } from '../typeTutorial';

export const StepStartTutorial = ({
  onSelect,
}: {
  onSelect: (step: Step) => void;
}): ReactElement => {
  return (
    <div>
      <p className='text-2xl font-bold pl-2'>Choose Your Path</p>
      <p className='text-sm text-gray-500 pb-4 pt-1 pl-2'>Select one of the three approaches to continue with your personalized experience.</p>
      <div className='flex flex-row gap-4 items-center justify-center'>
      {stepsStartView.map(
        ({ title, description, icon }, index) => (
          <button
            key={`${title}-${index}`}
            onClick={() => onSelect(title as Step)}
            className={classNames(
              'group relative overflow-hidden rounded-lg border-2 transition-all duration-300 p-0',
              'hover:scale-105 hover:shadow-lg'
            )}
          >
            <img 
              src={icon} 
              alt={title} 
              className={classNames(
                'block w-[250px] max-w-[300px] h-auto object-cover rounded-lg border-2 border-gray-200',
                'transition-all duration-300'
              )} 
            />
            
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col justify-between p-4">
              <div className="text-white font-semibold text-lg">
                {title}
              </div>
              
              <div className="text-white text-sm">
                {description}
              </div>
            </div>
          </button>
        )
      )}
      </div>
    </div>
  );
};
