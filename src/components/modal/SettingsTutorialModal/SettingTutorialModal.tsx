import { Dialog, DialogPanel } from '@headlessui/react';
import classNames from 'classnames';
import clsx from 'clsx';
import { FC, ReactElement, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TransitionGroup } from 'react-transition-group';
import { IconClose } from '../../Icons/IconClose';
import { StepChooseTutorial, StepStartTutorial, ListQuestion } from './components';
import {
  getQuestionsAi,
  getQuestionsChat,
} from './DataTutorial';
import { Step } from './typeTutorial';
import { DemoComponentForm } from './components/DemoComponentForm';

interface SettingTutorialModalProps {
  show: boolean;
  onClose: () => void;
}

export const SettingTutorialModal: FC<SettingTutorialModalProps> = ({
  show,
  onClose,
}): ReactElement => {
  const [step, setStep] = useState<Step>('Start');
  const [questionStep, setQuestionStep] = useState('default');
  const [selectedQuestionId] = useState<string | undefined>();
  const [animate, setAnimate] = useState(false);
  const { appId } = useParams();
  const questionsChat = getQuestionsChat(appId);
  const questionsAi = getQuestionsAi(appId);

  const handleChangeStep = (next: Step) => {
    setAnimate(true);
    setTimeout(() => {
      setStep(next);
      setAnimate(false);
    }, 200);
  };

  const handleChangeQuestionStep = (next: string) => {
    setAnimate(true);
    setTimeout(() => {
      setQuestionStep(next);
      setAnimate(false);
    }, 200);
  };

  const goBack = () => {
    if (step === 'ChatList' || step === 'AIList') {
      handleChangeStep('Start');
    } else if (step === 'ChatQuestion' || step === 'AIQuestion') {
      const listStep = step === 'ChatQuestion' ? 'ChatList' : 'AIList';
      handleChangeStep(listStep);
    } else {
      handleChangeStep('Start');
    }
  };

  const currentComponent = () => {
    switch (step) {
      case 'Start':
        return <StepStartTutorial onSelect={(selectedStep) => {
          if (selectedStep === 'Chat') {
            handleChangeStep('ChatList');
          } else if (selectedStep === 'AI') {
            handleChangeStep('AIList');
          } else {
            handleChangeStep(selectedStep);
          }
        }} />;
      case 'ChatList':
        return (
          <ListQuestion
            title="Chat"
            subtitle="Build or integrate instant messaging experience."
            questions={questionsChat}
            onClose={onClose}
            goBack={goBack}
            // onSelectQuestion={(questionId: string) => handleSelectQuestion(questionId, 'Chat')}
          />
        );
      case 'AIList':
        return (
          <ListQuestion
            title="AI"
            subtitle="Deploy AI agent for your visitors or your team."
            questions={questionsAi}
            onClose={onClose}
            goBack={goBack}
            // onSelectQuestion={(questionId: string) => handleSelectQuestion(questionId, 'AI')}
          />
        );
      case 'ChatQuestion':
        return (
          <StepChooseTutorial
            animate={animate}
            questionStep={questionStep}
            handleChangeQuestionStep={handleChangeQuestionStep}
            questions={questionsChat}
            goBack={goBack}
            navigateStart={`?tab=Appearance`}
            onClose={onClose}
            initialQuestionId={selectedQuestionId}
          />
        );
      case 'AIQuestion':
        return (
          <StepChooseTutorial
            animate={animate}
            questionStep={questionStep}
            handleChangeQuestionStep={handleChangeQuestionStep}
            questions={questionsAi}
            goBack={goBack}
            navigateStart={`?tab=AI+Widget`}
            onClose={onClose}
            initialQuestionId={selectedQuestionId}
          />
        );
      case 'Chat':
      case 'AI':
        const listStep = step === 'Chat' ? 'ChatList' : 'AIList';
        handleChangeStep(listStep);
        return null;
      case 'Demo':
        return (
          <DemoComponentForm
            animate={animate}
            goBack={goBack}
            onClose={onClose}
          />
        );
    }
  };

  return (
    <Dialog
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 transition duration-300"
      open={show}
      onClose={onClose}
    >
      <DialogPanel
        className={classNames(
          'p-4 sm:py-8 sm:px-8 bg-white rounded-3xl m-8 relative overflow-hidden max-h-[90vh] overflow-y-scroll scrollbar-hide',
          step === 'Start' ? 'w-auto' : 'w-[80%]',
          step === 'Demo' ? 'w-[50%]' : 'w-[80%]'
        )}
      >
        <button className="absolute top-[20px] right-[20px]" onClick={onClose}>
          <IconClose />
        </button>

        <TransitionGroup
          className={clsx(
            'transition-all duration-300 transform',
            animate ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'
          )}
        >
          {currentComponent()}
        </TransitionGroup>
      </DialogPanel>
    </Dialog>
  );
};
