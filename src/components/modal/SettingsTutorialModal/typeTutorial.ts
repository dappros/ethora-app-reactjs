export type Step = 'Start' | 'Chat' | 'AI' | 'Demo';

type QuestionPart = {
  title: string;
  description: Array<React.ReactNode>;
  image: string;
};

export type QuestionsType = {
  id: string;
  question: QuestionPart;
  answer: {
    time?: string;
    complexity?: number;
    description: Array<React.ReactNode>;
    images?: Array<string>;
  };
}[];