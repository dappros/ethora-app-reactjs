import { Dialog, DialogPanel } from '@headlessui/react';
import clsx from 'clsx';
import { FC, ReactElement, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TransitionGroup } from 'react-transition-group';
import { IconClose } from '../../Icons/IconClose';
import { StepChooseTutorial, StepStartTutorial } from './components';
import {
  getQuestionsAi,
  getQuestionsChat,
  getQuestionsDemo,
} from './DataTutorial';
import { Step } from './typeTutorial';

interface SettingTutorialModalProps {
  show: boolean;
  onClose: () => void;
}

export const SettingTutorialModal: FC<SettingTutorialModalProps> = ({
  show,
  onClose,
}): ReactElement => {
  const [step, setStep] = useState<Step>('Start');
  const [animate, setAnimate] = useState(false);
  const { appId } = useParams();
  const questionsChat = getQuestionsChat(appId);
  const questionsAi = getQuestionsAi(appId);
  const questionsDemo = getQuestionsDemo();

  const handleChangeStep = (next: Step) => {
    setAnimate(true);
    setTimeout(() => {
      setStep(next);
      setAnimate(false);
    }, 200);
  };

  const goBack = () => handleChangeStep('Start');

  const currentComponent = () => {
    switch (step) {
      case 'Start':
        return <StepStartTutorial onSelect={handleChangeStep} />;
      case 'Chat':
        return <StepChooseTutorial questions={questionsChat} goBack={goBack} />;
      case 'AI':
        return <StepChooseTutorial questions={questionsAi} goBack={goBack} />;
      case 'Demo':
        return <StepChooseTutorial questions={questionsDemo} goBack={goBack} />;
    }
  };

  return (
    <Dialog
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 transition duration-300"
      open={show}
      onClose={onClose}
    >
      <DialogPanel className="p-4 sm:py-8 sm:px-8 bg-white rounded-3xl w-full max-w-[70%] md:max-w-[60%] lg:max-w-[40%] m-8 relative overflow-hidden">
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
