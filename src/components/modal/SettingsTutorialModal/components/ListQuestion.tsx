import { ReactElement } from "react"
import { QuestionsType } from "../typeTutorial"
import { StepLayout } from "."
import classNames from "classnames";

export const ListQuestion = ({ 
  questions, 
  goBack,
  onSelectQuestion 
}: { 
  questions: QuestionsType;
  goBack: () => void;
  onSelectQuestion: (questionId: string) => void;
}): ReactElement => {
  return (
    <StepLayout goBack={goBack}>
      <div className="flex flex-col gap-4 w-full">
        <div className="mb-4">
          <p className="text-2xl font-bold">Choose question</p>
          <p className="text-sm text-gray-500 mt-1">Choose the question you are interested in from the list</p>
        </div>
        <div className="flex flex-col">
          {questions.map((data, index) => (
            <button
              key={data.id}
              onClick={() => onSelectQuestion(data.id)}
              className="flex flex-col items-start gap-3 text-left p-4 pb-0 w-full hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-3 w-full">
                {data.question.image && (
                  <img 
                    src={data.question.image} 
                    alt={data.question.title} 
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className={classNames(
                    "flex flex-col flex-1 border-b border-gray-300 pb-8",
                    index === questions.length - 1 ? "border-b-0" : "border-b"
                )}>
                  <h3 className="font-semibold text-base">{data.question.title}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                      <span>{data.question.description}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </StepLayout>
  )
}