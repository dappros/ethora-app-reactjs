import { NavLink } from 'react-router-dom';
import { QuestionsType } from './typeTutorial';

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

export const stepsStartView: {
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor?: string;
}[] = [
  {
    title: 'Chat',
    description: 'Build or integrate instant messaging experience.',
    icon: IconChat,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
  },
  {
    title: 'AI',
    description: 'Deploy AI agent for your visitors or your team.',
    icon: IconAi,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100',
  },
  {
    title: 'Demo',
    description: 'Book a demo with Ethora team.',
    icon: IconDemo,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
  },
];

export const getQuestionsChat = (query?: string): QuestionsType => [
  {
    id: 'one',
    question: {
      title: 'New web app',
      time: `(no code, 5 min)`,
      description: 'Launch your own web app with unique URL address, logo and colours without leaving the admin panel. Manage Chat rooms, on-board Users and AI agents if required.',
      image: ChatTutorialOne,
      link: `/app/admin/apps/${query}/settings?tab=Appearance`
    },
    answer: {
      time: `5–15 minutes`,
      complexity: 2,
      description: [
        'Launch your own web app with unique URL address, logo and colours without leaving the admin panel. Manage Chat rooms, on-board Users and AI agents if required.',
      ],
      // images: ['/src/assets/gif/appearance.gif'],
      video: ChatVideoOne,
    },
  },
  {
    id: 'two',
    question: {
      title: 'New iOS/Android React Native app',
      time: `(low code, 30 min)`,
      description: 'Build your own iOS or Android app using our open-source engine. Manage Chat rooms, on-board Users and AI agents if required.',
      image: ChatTutorialTwo,
      link: `/app/admin/apps/${query}/settings?tab=Mobile+App`
    },
    answer: {
      time: `5–15 minutes`,
      complexity: 2,
      description: [
        'Build your own iOS or Android app using our open-source engine. Manage Chat rooms, on-board Users and AI agents if required.',
      ],
      images: ['/src/assets/gif/webApp.gif'],
    },
  },
  {
    id: 'three',
    question: {
      title: 'Existing app integration',
      time: `(days)`,
      description: 'Add chat into your existing apps using Ethora SDK: NPM chat component, Swift SPM library, Javascript iframe widget, API, Chat Protocol and Bots Framework.',
      image: ChatTutorialThree,
      link: `https://github.com/dappros`
    },
    answer: {
      time: `5–15 minutes`,
      complexity: 2,
      description: [
        'Add chat into your existing apps using Ethora SDK: NPM chat component, Swift SPM library, Javascript iframe widget, API, Chat Protocol and Bots Framework.',
      ],
    },
  },
];

export const getQuestionsAi = (query?: string): QuestionsType => [
  {
    id: 'one',
    question: {
      title: 'AI widget (copy & paste)',
      time: `(low code, 10 min)`,
      description: 'Get a Javascript to add AI agent into your website or test it right here in the admin panel. Index your website or upload documents to train your project specific AI agent.',
      image: AiTutorialOne,
      link: `/app/admin/apps/${query}/settings?tab=AI+Widget`
    },
    answer: {
      time: `5–15 minutes`,
      complexity: 2,
      description: [
        'Use the opportunity to give your AI widget a branded look — specify a convenient and memorable name, and set the path to a local avatar so the widget fits perfectly into your project’s design. After configuring everything, simply copy the generated code and paste it at the end of the <body> tag — and your personalized AI assistant will be fully ready to work in your application or on your website. Fast, simple, and without any extra steps.',
      ],
      images: [AiTutorialOneAnswer],
    },
  },
  {
    id: 'two',
    question: {
      title: 'AI widget (WP plugin)',
      time: `(low code, 15 min)`,
      description: 'Download and install our Wordpress plugin to launch AI agent for your website. Index your website or upload documents via admin panel to manage context.',
      image: AiTutorialTwo,
      link: `/app/admin/apps/${query}/settings?tab=AI+Widget`
    },
    answer: {
      time: `5–15 minutes`,
      complexity: 2,
      description: [
        'Use this section to define your bot’s personality and interaction style. Here, you can describe in detail how the assistant should respond to users, what tasks it should perform, and what tone of communication it should maintain. If needed, you can also add important context about your business so the bot understands the specifics of your products and works as accurately and effectively as possible.',
      ],
      images: [AiTutorialTwoAnswer],
    },
  },
  {
    id: 'three',
    question: {
      title: 'AI web app',
      time: `(no code, 15 min)`,
      description: 'Launch your own AI agent app with your unique URL, logo and branding. Index your website or upload documents to make your AI agent efficient for your use case.',
      image: AiTutorialThree,
      link: `/app/admin/apps/${query}/settings?tab=AI+Widget`
    },
    answer: {
      time: `5–15 minutes`,
      complexity: 2,
      description: [
        <span>
          Take user to{' '}
          <NavLink
            to={`/app/admin/apps/${query}/settings?tab=AI+bot`}
            className="text-blue-600 underline inline"
          >
            Ai bot
          </NavLink>{' '}
          tab
        </span>,
      ],
    },
  },
];
