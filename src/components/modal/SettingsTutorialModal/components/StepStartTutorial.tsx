import classNames from 'classnames';
import { ReactElement } from 'react';
import { StepLayout } from '.';
import { stepsStartView } from '../DataTutorial';
import { Step } from '../typeTutorial';

export const StepStartTutorial = ({
  onSelect,
}: {
  onSelect: (step: Step) => void;
}): ReactElement => {
  return (
    <StepLayout
      title="Choose Your Path"
      description="Select one of the three approaches to continue with your personalized
        experience."
    >
      {stepsStartView.map(
        ({ title, description, icon: Icon, color, bgColor }, index) => (
          <button
            key={`${title}-${index}`}
            onClick={() => onSelect(title as Step)}
            className={classNames(
              'btn flex items-start gap-3 text-left p-4 w-full rounded-lg border hover:bg-gray-100 transition',
              color,
              bgColor
            )}
          >
            <div className="flex-shrink-0 text-blue-500">
              <Icon className={classNames(color)} />
            </div>

            <div className="flex flex-col">
              <span className="font-medium text-sm">{title}</span>
              <span className="text-xs text-gray-500">{description}</span>
            </div>
          </button>
        )
      )}
    </StepLayout>
  );
};
