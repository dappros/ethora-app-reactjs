import clsx from 'clsx';
import { ReactElement, useState } from 'react';
import { StepLayout } from '.';
import { QuestionsType } from '../typeTutorial';
import { useNavigate } from 'react-router-dom';

import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

export const StepChooseTutorial = ({
  questions,
  goBack,
  animate,
  navigateStart,
  onClose,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  questionStep: _questionStep,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleChangeQuestionStep: _handleChangeQuestionStep,
  initialQuestionId,
}: {
  navigateStart?: string;
  goBack: () => void;
  onClose: () => void;
  questions: QuestionsType;
  animate: boolean;
  questionStep: string;
  handleChangeQuestionStep: (next: string) => void;
  initialQuestionId?: string;
}): ReactElement => {
  const navigate = useNavigate();
  
  // Находим индекс начального вопроса по ID, если он передан
  const getInitialStep = () => {
    if (initialQuestionId) {
      const index = questions.findIndex(q => q.id === initialQuestionId);
      return index >= 0 ? index : 0;
    }
    return 0;
  };
  
  const [currentStep, setCurrentStep] = useState(getInitialStep);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const totalSteps = questions.length;

  if (totalSteps === 0) {
    return (
      <div className="text-center py-8">
        <p>No questions available</p>
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setDirection('right');
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection('left');
      setCurrentStep(prev => prev - 1);
    } else {
      goBack();
    }
  };

  const handleStart = () => {
    navigate(navigateStart || '/');
    onClose();
  };


  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div
      className={clsx(
        'transition-all duration-300 transform',
        animate ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'
      )}
    >
      <StepLayout goBack={goBack}>
        <div className="relative overflow-hidden w-full">
          <style>{`
            @keyframes slideInFromRight {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            @keyframes slideInFromLeft {
              from {
                transform: translateX(-100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            .slide-in-right {
              animation: slideInFromRight 0.3s ease-in-out;
            }
            .slide-in-left {
              animation: slideInFromLeft 0.3s ease-in-out;
            }
          `}</style>
          <div
            key={currentStep}
            className={clsx(
              'flex flex-col gap-4 w-full',
              direction === 'right' ? 'slide-in-right' : 'slide-in-left'
            )}
          >

            <div className="flex flex-col items-start gap-2 pt-2 pl-2">
              {currentQuestion.answer.description.map((desc, index) => (
                <div key={index} className="w-[75%]" style={{ margin: '0 auto' }}>
                  
                  {currentQuestion.answer.images && currentQuestion.answer.images[index] && (
                    <img
                      src={currentQuestion.answer.images[index]}
                      alt="Demo animation"
                      className="w-full rounded-lg w-[80%]"
                      style={{ margin: '0 auto' }}
                    />
                  )}
                  {currentQuestion.answer.video && (
                    <video 
                      src={currentQuestion.answer.video} 
                      className="w-full rounded-lg w-[80%]" 
                      style={{ margin: '0 auto' }}
                      controls
                      loop
                    >
                      <source src={currentQuestion.answer.video} type="video/mp4" />
                    </video>
                  )}
                  <div className="btn flex items-start text-left w-full pt-4">
                      <span className="font-medium text-lg font-bold">{currentQuestion.question.title}</span>
                  </div>

                  <div className="pt-4">
                    {desc}
                  </div>
                </div>
              ))}
              
              {/* <div className="flex items-center justify-around py-2 w-full">
                {currentQuestion.answer.time && (
                  <div className="py-2">
                    <strong>Time: </strong>
                    {currentQuestion.answer.time}
                  </div>
                )}
                
                {currentQuestion.answer.complexity && (
                  <div className="flex items-center gap-2 py-2">
                    <strong>Complexity: </strong>
                    <Rating
                      name="read-only"
                      value={currentQuestion.answer.complexity}
                      readOnly
                      size="small"
                    />
                  </div>
                )}
              </div> */}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t w-full">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleBack}
            className="mr-4 bg-brand-500 rounded-full flex items-center transition-colors disabled:text-gray-400 disabled:cursor-not-allowed p-1"
            disabled={currentStep === 0}
          >
            <KeyboardArrowLeftRoundedIcon 
              className="text-white" 
             
            />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={clsx(
                  'rounded-full transition-all',
                  index === currentStep
                    ? 'w-2 h-2 bg-blue-600'
                    : 'w-2 h-2 bg-gray-300'
                )}
              />
            ))}
          </div>
          
          <button
            onClick={isLastStep ? handleStart : handleNext}
            className="ml-4 bg-brand-500 rounded-full flex items-center transition-colors disabled:text-gray-400 disabled:cursor-not-allowed p-1"
          >
            <span className="text-white">{isLastStep ? 'GO START' : ''}</span>
            {!isLastStep && <KeyboardArrowRightRoundedIcon  className="text-white" />}
          </button>
        </div>
      </div>
      </StepLayout>
    </div>
  );
};
