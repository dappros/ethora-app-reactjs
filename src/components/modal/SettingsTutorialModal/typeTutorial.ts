export type Step = 'Start' | 'Chat' | 'AI' | 'Demo' | 'ChatList' | 'AIList' | 'ChatQuestion' | 'AIQuestion';

type QuestionPart = {
  title: string;
  description: string;
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