import { Rating } from '@mui/material';
import { ReactElement, useMemo } from 'react';
import { StepLayout } from '.';
import { QuestionsType } from '../typeTutorial';

interface AnswerStepProps {
  questions: QuestionsType;
  answer: string;
  setQuestionStep: (id: string) => void;
}

export const AnswerStep = ({
  questions,
  answer,
  setQuestionStep,
}: AnswerStepProps): ReactElement => {
  const filteredAnswer = useMemo(() => {
    return questions.filter((question) => question.id === answer)[0];
  }, [answer, questions]);

  // const title = useMemo(() => {
  //   return <span>{filteredAnswer.question.map((question) => question)}</span>;
  // }, [filteredAnswer.question]);

  return (
    <StepLayout goBack={() => setQuestionStep('default')}>
      <div className="btn flex items-start gap-3 text-left p-4 w-full rounded-lg border bg-gray-100 hover:bg-white transition">
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {filteredAnswer.question.title}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-start gap-2 pt-4 pl-2">
        <div className="py-2">
          <strong>Answer:</strong> {filteredAnswer.answer.description[0]}
        </div>
        {filteredAnswer.answer.images && (
          <img
            src={filteredAnswer.answer.images[0]}
            alt="Demo animation"
            className="w-full"
          />
        )}
        <div className="py-2">
          <strong>Answer:</strong> {filteredAnswer.answer.description[1]}
        </div>
        {filteredAnswer.answer.images && (
          <img
            src={filteredAnswer.answer.images[1]}
            alt="Demo animation"
            className="w-full"
          />
        )}
        {filteredAnswer.answer.time && (
          <div>
            <strong>Time: </strong>
            {filteredAnswer.answer.time}
          </div>
        )}
        {filteredAnswer.answer.complexity && (
          <div className="flex items-center gap-2">
            <strong>Complexity: </strong>
            <Rating
              name="read-only"
              value={filteredAnswer.answer.complexity}
              readOnly
            />
          </div>
        )}
      </div>
    </StepLayout>
  );
};
