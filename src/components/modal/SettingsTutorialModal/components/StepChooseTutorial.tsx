import clsx from 'clsx';
import { ReactElement, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { AnswerStep, QuestionsStepDefault } from '.';
import { QuestionsType } from '../typeTutorial';

export const StepChooseTutorial = ({
  questions,
  goBack,
}: {
  goBack: () => void;
  questions: QuestionsType;
}): ReactElement => {
  const [chatStep, setChatStep] = useState('default');
  const [animate, setAnimate] = useState(false);

  const handleChangeStep = (next: string) => {
    setAnimate(true);
    setTimeout(() => {
      setChatStep(next);
      setAnimate(false);
    }, 200);
  };

  const currentComponent = () => {
    switch (chatStep) {
      case 'default':
        return (
          <QuestionsStepDefault
            questions={questions}
            goBack={goBack}
            setChatStep={handleChangeStep}
          />
        );
      default:
        return (
          <AnswerStep
            questions={questions}
            answer={chatStep}
            setChatStep={handleChangeStep}
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
