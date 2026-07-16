import { NavLink } from 'react-router-dom';
import { QuestionsType, Step } from './typeTutorial';
import { useTranslation } from '../../../i18n/useTranslation';

// This file only exports plain data-generator functions (not React
// components), so the useTranslation() hook itself can't be called here -
// hooks may only run during a component's render. Instead, callers that are
// components (SettingTutorialModal.tsx, StepStartTutorial.tsx) call
// useTranslation() themselves and pass the resulting `t` in as a parameter.
type TFunction = ReturnType<typeof useTranslation>['t'];

import IconChat from '../../../assets/tutorial/tutorial-chat.png';
import IconAi from '../../../assets/tutorial/tutorial-ai.png';
import IconDemo from '../../../assets/tutorial/tutorial-demo.png';


// Chat tutorial
import ChatTutorialOne from '../../../assets/tutorial/chat/chat_tutorial_one.png';
import ChatTutorialTwo from '../../../assets/tutorial/chat/chat_tutorial_two.png';
import ChatTutorialThree from '../../../assets/tutorial/chat/chat_tutorial_three.png';

//Chat video
import ChatVideoOne from '../../../assets/tutorial/video/appearance_chat_tutorial.mp4';

// AI tutorial
import AiTutorialOne from '../../../assets/tutorial/widget/widget_tutorial_one.png';
import AiTutorialOneAnswer from '../../../assets/tutorial/widget/widget_tutorial_one_answer.png';
import AiTutorialTwo from '../../../assets/tutorial/widget/widget_tutorial_two.png';
import AiTutorialTwoAnswer from '../../../assets/tutorial/widget/widget_tutorial_two_answer.png';
import AiTutorialThree from '../../../assets/tutorial/widget/widget_tutorial_three.png';

export const getStepsStartView = (
  t: TFunction
): {
  step: Step;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor?: string;
}[] => [
  {
    step: 'Chat',
    title: t('dataTutorial.chat.title'),
    description: t('dataTutorial.chat.description'),
    icon: IconChat,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
  },
  {
    step: 'AI',
    title: t('dataTutorial.ai.title'),
    description: t('dataTutorial.ai.description'),
    icon: IconAi,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100',
  },
  {
    step: 'Demo',
    title: t('dataTutorial.demo.title'),
    description: t('dataTutorial.demo.description'),
    icon: IconDemo,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
  },
];

export const getQuestionsChat = (
  t: TFunction,
  query?: string
): QuestionsType => [
  {
    id: 'one',
    question: {
      title: t('dataTutorial.chat.one.title'),
      time: t('dataTutorial.chat.one.time'),
      description: t('dataTutorial.chat.one.description'),
      image: ChatTutorialOne,
      link: `/app/admin/apps/${query}/settings?tab=Appearance`
    },
    answer: {
      time: t('dataTutorial.answerTimeDefault'),
      complexity: 2,
      description: [
        t('dataTutorial.chat.one.description'),
      ],
      // images: ['/src/assets/gif/appearance.gif'],
      video: ChatVideoOne,
    },
  },
  {
    id: 'two',
    question: {
      title: t('dataTutorial.chat.two.title'),
      time: t('dataTutorial.chat.two.time'),
      description: t('dataTutorial.chat.two.description'),
      image: ChatTutorialTwo,
      link: `/app/admin/apps/${query}/settings?tab=Mobile+App`
    },
    answer: {
      time: t('dataTutorial.answerTimeDefault'),
      complexity: 2,
      description: [
        t('dataTutorial.chat.two.description'),
      ],
      images: ['/src/assets/gif/webApp.gif'],
    },
  },
  {
    id: 'three',
    question: {
      title: t('dataTutorial.chat.three.title'),
      time: t('dataTutorial.chat.three.time'),
      description: t('dataTutorial.chat.three.description'),
      image: ChatTutorialThree,
      link: `https://github.com/dappros`
    },
    answer: {
      time: t('dataTutorial.answerTimeDefault'),
      complexity: 2,
      description: [
        t('dataTutorial.chat.three.description'),
      ],
    },
  },
];

export const getQuestionsAi = (
  t: TFunction,
  query?: string
): QuestionsType => [
  {
    id: 'one',
    question: {
      title: t('dataTutorial.ai.one.title'),
      time: t('dataTutorial.ai.one.time'),
      description: t('dataTutorial.ai.one.description'),
      image: AiTutorialOne,
      link: `/app/admin/apps/${query}/settings?tab=AI+Widget`
    },
    answer: {
      time: t('dataTutorial.answerTimeDefault'),
      complexity: 2,
      description: [
        t('dataTutorial.ai.one.answerDescription'),
      ],
      images: [AiTutorialOneAnswer],
    },
  },
  {
    id: 'two',
    question: {
      title: t('dataTutorial.ai.two.title'),
      time: t('dataTutorial.ai.two.time'),
      description: t('dataTutorial.ai.two.description'),
      image: AiTutorialTwo,
      link: `https://github.com/dappros/ethora-wp-plugin`
    },
    answer: {
      time: t('dataTutorial.answerTimeDefault'),
      complexity: 2,
      description: [
        t('dataTutorial.ai.two.answerDescription'),
      ],
      images: [AiTutorialTwoAnswer],
    },
  },
  {
    id: 'three',
    question: {
      title: t('dataTutorial.ai.three.title'),
      time: t('dataTutorial.ai.three.time'),
      description: t('dataTutorial.ai.three.description'),
      image: AiTutorialThree,
      link: `/app/admin/apps/${query}/settings?tab=AI+Widget`
    },
    answer: {
      time: t('dataTutorial.answerTimeDefault'),
      complexity: 2,
      description: [
        <span>
          {t('dataTutorial.ai.three.answerTakeUserTo')}{' '}
          <NavLink
            to={`/app/admin/apps/${query}/settings?tab=AI+bot`}
            className="text-blue-600 underline inline"
          >
            {t('dataTutorial.ai.three.answerBotLinkLabel')}
          </NavLink>{' '}
          {t('dataTutorial.ai.three.answerTab')}
        </span>,
      ],
    },
  },
];
