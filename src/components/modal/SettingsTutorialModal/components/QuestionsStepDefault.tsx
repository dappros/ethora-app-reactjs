import classNames from 'classnames';
import { ReactElement } from 'react';
import { StepLayout } from '.';
import { QuestionsType } from '../typeTutorial';
import { useTranslation } from '../../../../i18n/useTranslation';

interface QuestionsStepDefaultProps {
  questions: QuestionsType;
  goBack: () => void;
  setQuestionStep: (id: string) => void;
}

export const QuestionsStepDefault = ({
  questions,
  goBack,
  setQuestionStep,
}: QuestionsStepDefaultProps): ReactElement => {
  const { t } = useTranslation();
  return (
    <StepLayout
      title={t('questionsStepDefault.title')}
      description={t('questionsStepDefault.description')}
      goBack={goBack}
    >
      {questions.map(({ id, question }, index) => (
        <button
          key={`${id}-${index}`}
          onClick={() => setQuestionStep(id)}
          className={classNames(
            'btn flex items-start gap-3 text-left p-4 w-full rounded-lg border hover:bg-gray-100 transition'
          )}
        >
          <div className="flex flex-col">
            <span className="font-medium text-sm">
                <span>{question.title}</span>
            </span>
          </div>
        </button>
      ))}
    </StepLayout>
  );
};
