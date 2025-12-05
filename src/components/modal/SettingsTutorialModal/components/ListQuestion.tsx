import { ReactElement } from "react"
import { QuestionsType } from "../typeTutorial"
import { StepLayout } from "."
import { useNavigate } from "react-router-dom";

export const ListQuestion = ({ 
  questions, 
  goBack,
  onClose,
  title,
  subtitle
}: { 
  questions: QuestionsType;
  goBack: () => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}): ReactElement => {
  const navigate = useNavigate();
  
  const handleClick = (link: string) => {
    navigate(link);
    onClose();
  }
  return (
    <StepLayout goBack={goBack}>
      <div className="flex flex-col gap-6 w-full">
        <div className="mb-2">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-6 pt-16 md:pt-20">
          {questions.map((data) => (
            <button
              key={data.id}
              onClick={() => handleClick(data.question.link)}
              className="relative flex flex-col text-left group h-full"
            >
              <div className="absolute left-1/2 -translate-x-1/2 -top-14 md:-top-16 z-10">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-colors">
                  {data.question.image && (
                    <img 
                      src={data.question.image} 
                      alt={data.question.title} 
                      className="w-20 h-20 md:w-24 md:h-24 object-contain"
                    />
                  )}
                </div>
              </div>

              <div className="bg-white/90 hover:bg-blue-100/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-md transition-all duration-200 pt-16 md:pt-20 pb-6 px-4 flex flex-col flex-1">
                <div className="min-h-[3.5rem] md:min-h-[4rem] flex flex-col items-center justify-center text-center">
                  <h3 className="font-bold text-base md:text-lg text-gray-900 leading-tight">
                    {data.question.title}
                  </h3>
                  {data.question.time && (
                    <span className="text-sm text-gray-400 mt-1">
                      {data.question.time}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 leading-relaxed text-center mt-3 flex-1">
                  {data.question.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </StepLayout>
  )
}