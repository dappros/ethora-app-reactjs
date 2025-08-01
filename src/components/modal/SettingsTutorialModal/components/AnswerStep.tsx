import { ReactElement, useMemo } from 'react';
import { StepLayout } from '.';
import { QuestionsType } from '../typeTutorial';

interface AnswerStepProps {
  questions: QuestionsType;
  answer: string;
  setChatStep: (id: string) => void;
}

export const AnswerStep = ({
  questions,
  answer,
  setChatStep,
}: AnswerStepProps): ReactElement => {
  const filteredAnswer = useMemo(() => {
    return questions.filter((question) => question.id === answer)[0];
  }, [answer, questions]);

  // const title = useMemo(() => {
  //   return <span>{filteredAnswer.question.map((question) => question)}</span>;
  // }, [filteredAnswer.question]);

  return (
    <StepLayout goBack={() => setChatStep('default')}>
      <div className="btn flex items-start gap-3 text-left p-4 w-full rounded-lg border bg-gray-100 hover:bg-white transition">
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {filteredAnswer.question.map((part, i) => (
              <span key={i}>{part}</span>
            ))}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-start gap-2 pt-4 pl-2">
        <div>
          <strong>Answer:</strong> {filteredAnswer.answer.description}
        </div>
        {filteredAnswer.answer.time && (
          <div>
            <strong>Time: </strong>
            {filteredAnswer.answer.time}
          </div>
        )}
        {filteredAnswer.answer.complexity && (
          <div>
            <strong>Complexity: </strong>
            {filteredAnswer.answer.complexity}
          </div>
        )}
      </div>
    </StepLayout>
  );
};
