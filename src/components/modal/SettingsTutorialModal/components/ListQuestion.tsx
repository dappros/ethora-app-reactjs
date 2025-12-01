import { ReactElement } from "react"
import { QuestionsType } from "../typeTutorial"

export const ListQuestion = ({ questions }: { questions: QuestionsType }): ReactElement => {
  return (
    <div>
      {questions.map((data) => (
        <button key={data.id}>
          <div className="flex flex-col">
            <img src={data.question.image} alt={data.question.title} />
          </div>
          <div>
            <h3>{data.question.title}</h3>
            <p>{data.question.description}</p>
          </div>
        </button>
      ))}
    </div>
  )
}