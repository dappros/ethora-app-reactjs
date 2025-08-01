import classNames from 'classnames';
import { ReactElement } from 'react';
import { StepLayout } from '.';
import { QuestionsType } from '../typeTutorial';

interface QuestionsStepDefaultProps {
  questions: QuestionsType;
  goBack: () => void;
  setChatStep: (id: string) => void;
}

export const QuestionsStepDefault = ({
  questions,
  goBack,
  setChatStep,
}: QuestionsStepDefaultProps): ReactElement => {
  return (
    <StepLayout
      title="Choose a Chat Setting"
      description="I want to.."
      goBack={goBack}
    >
      {questions.map(({ id, question }, index) => (
        <button
          key={`${id}-${index}`}
          onClick={() => setChatStep(id)}
          className={classNames(
            'btn flex items-start gap-3 text-left p-4 w-full rounded-lg border hover:bg-gray-100 transition'
          )}
        >
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {question.map((part, i) => (
                <span key={i}>{part}</span>
              ))}
            </span>
          </div>
        </button>
      ))}
    </StepLayout>
  );
};
