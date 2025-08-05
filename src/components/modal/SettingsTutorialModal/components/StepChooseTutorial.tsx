import clsx from 'clsx';
import { ReactElement } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { AnswerStep, QuestionsStepDefault } from '.';
import { QuestionsType } from '../typeTutorial';

export const StepChooseTutorial = ({
  questions,
  goBack,
  animate,
  questionStep,
  handleChangeQuestionStep,
}: {
  goBack: () => void;
  questions: QuestionsType;
  animate: boolean;
  questionStep: string;
  handleChangeQuestionStep: (next: string) => void;
}): ReactElement => {
  const currentComponent = () => {
    switch (questionStep) {
      case 'default':
        return (
          <QuestionsStepDefault
            questions={questions}
            goBack={goBack}
            setQuestionStep={handleChangeQuestionStep}
          />
        );
      default:
        return (
          <AnswerStep
            questions={questions}
            answer={questionStep}
            setQuestionStep={handleChangeQuestionStep}
          />
        );
    }
  };

  return (
    <>
      <TransitionGroup
        className={clsx(
          'transition-all duration-300 transform',
          animate ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'
        )}
      >
        {currentComponent()}
      </TransitionGroup>
    </>
  );
};
