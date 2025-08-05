export type Step = 'Start' | 'Chat' | 'AI' | 'Demo';

type QuestionPart = string | React.ReactNode;

export type QuestionsType = {
  id: string;
  question: QuestionPart[];
  answer: {
    time?: string;
    complexity?: number;
    description: Array<React.ReactNode>;
    images?: Array<string>;
  };
}[];