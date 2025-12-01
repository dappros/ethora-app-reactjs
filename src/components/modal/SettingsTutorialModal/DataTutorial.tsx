import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { NavLink } from 'react-router-dom';
import { QuestionsType } from './typeTutorial';

import IconChat from '../../../assets/tutorial/tutorial-chat.png';
import IconAi from '../../../assets/tutorial/tutorial-ai.png';
import IconDemo from '../../../assets/tutorial/tutorial-demo.png';

import ChatTutorialOne from '../../../assets/tutorial/chat/chat_tutorial_one.png';
import ChatTutorialTwo from '../../../assets/tutorial/chat/chat_tutorial_two.png';
import ChatTutorialThree from '../../../assets/tutorial/chat/chat_tutorial_three.png';

export const stepsStartView: {
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor?: string;
}[] = [
  {
    title: 'Chat',
    description: 'Talk to our assistant in real-time',
    icon: IconChat,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
  },
  {
    title: 'AI',
    description: 'Get AI-powered assistance',
    icon: IconAi,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100',
  },
  {
    title: 'Demo',
    description: 'Explore a demo of our features',
    icon: IconDemo,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
  },
];

export const getQuestionsChat = (query?: string): QuestionsType => [
  {
    id: 'one',
    question: {
      title: 'Quickly build a new Chat app for Web (using no code or low code if possible)',
      description: 'Quickly build a new Chat app for Web (using no code or low code if possible)',
      image: ChatTutorialOne,
    },
    answer: {
      time: `5–15 minutes`,
      complexity: 2,
      description: [
        <span>
          Go to the{' '}
          <NavLink
            to={`/app/admin/apps/${query}/settings?tab=Appearance`}
            className="text-blue-600 underline inline"
          >
            Appearance
          </NavLink>{' '}
          section to give your application a unique style and emphasize its individuality. Here, you can set an attractive Display Name, add a memorable Tagline, choose a signature color to enhance the visual identity, and upload a logo — a key branding element that will help your application stand out from the rest.
        </span>,
      ],
      images: ['/src/assets/gif/appearance.gif'],
    },
  },
  {
    id: 'two',
    question: {
      title: 'Quickly build a new Chat app for Web (using no code or low code if possible)',
      description: 'Quickly build a new Chat app for iOS or Android (using no code or low code if possible)',
      image: ChatTutorialTwo,
    },
    answer: {
      time: `5–15 minutes`,
      complexity: 2,
      description: [
        <span>
          Go to the{' '}
          <NavLink
            to={`/app/admin/apps/${query}/settings?tab=Web+App`}
            className="text-blue-600 underline inline"
          >
            Web
          </NavLink>{' '}
          , then enter the URL address of the application name and navigate to
          it.
        </span>,
      ],
      images: ['/src/assets/gif/webApp.gif'],
    },
  },
  {
    id: 'three',
    question: {
      title: 'Quickly build a new Chat app for iOS or Android (using no code or low code if possible)',
      description: 'Quickly build a new for iOS or Android (using no code or low code if possible)',
      image: ChatTutorialThree,
    },
    answer: {
      time: `5–15 minutes`,
      complexity: 2,
      description: [
        <span>
          Take user to{' '}
          <NavLink
            to={`/app/admin/apps/${query}/settings?tab=Widget`}
            className="text-blue-600 underline"
          >
            Mobile
          </NavLink>{' '}
          &{' '}
          <NavLink
            to={`/app/admin/apps/${query}/settings?tab=Appearance`}
            className="text-blue-600 underline inline"
          >
            Appearance
          </NavLink>{' '}
          , then guide to test as End User
        </span>,
      ],
    },
  },
  {
    id: 'four',
    question: {
      title: 'develop a new app from scratch or integrate chat screen into my React or Javascript app (using Ethora SDK NPM component) leveraging Ethora Chat & AI infrastructure',
      description:  'develop a new app from scratch or integrate chat screen into my React or Javascript app (using Ethora SDK NPM component) leveraging Ethora Chat & AI infrastructure',
      image: IconChat,
    },
    answer: {
      time: `days to weeks`,
      complexity: 4,
      description: [<span>Take user to documentation on NPM component</span>],
    },
  },
  {
    id: 'five',
    question: {
      title: 'develop a new app from scratch or integrate chat screen into my React or Javascript app (using Ethora SDK NPM component) leveraging Ethora Chat & AI infrastructure',
      description: 'develop a new app from scratch or integrate chat screen into my React or Javascript app (using Ethora SDK NPM component) leveraging Ethora Chat & AI infrastructure',
      image: IconChat,
    },
    answer: {
      time: `days to weeks`,
      complexity: 4,
      description: [<span>Take user to documentation on NPM component</span>],
    },
  },
  {
    id: 'six',
    question: {
      title: 'develop a new app from scratch or integrate chat screen into my React or Javascript app (using Ethora SDK NPM component) leveraging Ethora Chat & AI infrastructure',
      description: 'develop a new app from scratch or integrate chat screen into my React or Javascript app (using Ethora SDK NPM component) leveraging Ethora Chat & AI infrastructure',
      image: IconChat,
    },
    answer: {
      time: `days to weeks`,
      complexity: 4,
      description: [<span>Take user to documentation on NPM component</span>],
    },
  },
  {
    id: 'seven',
    question: {
      title: 'develop a new app from scratch or integrate chat screen into my React or Javascript app (using Ethora SDK NPM component) leveraging Ethora Chat & AI infrastructure',
      description: 'develop a new app from scratch or integrate chat screen into my React or Javascript app (using Ethora SDK NPM component) leveraging Ethora Chat & AI infrastructure',
      image: IconChat,
    },
    answer: {
      time: `days to weeks`,
      complexity: 4,
      description: [<span>Take user to documentation on NPM component</span>],
    },
  },
];

export const getQuestionsAi = (query?: string): QuestionsType => [
  {
    id: 'one',
    question: {
      title: '..add AI to my no-code web/mobile app built with Ethora',
      description: '..add AI to my no-code web/mobile app built with Ethora',
      image: IconChat,
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
  {
    id: 'two',
    question: {
      title: '..add AI to my Wordpress website (using a WP plugin)',
      description: '..add AI to my Wordpress website (using a WP plugin)',
      image: IconChat,
    },
    answer: {
      time: `0.5–1 hour`,
      complexity: 2,
      description: [
        <span>Take user to documentation on WP or WP plugin page</span>,
      ],
    },
  },
  {
    id: 'three',
    question: {
      title: '..add AI to my website, web app or enterprise web portal (using a ready widget code)',
      description: '..add AI to my website, web app or enterprise web portal (using a ready widget code)',
      image: IconChat,
    },
    answer: {
      time: `0.5–4 hours`,
      complexity: 2,
      description: [
        <span>
          TaTake user to{' '}
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

export const getQuestionsDemo = (): QuestionsType => [
  {
    id: 'one',
    question: {
      title: 'Book a free feasibility call with Ethora team to help you choose the right tools and see examples in action.',
      description: 'Book a free feasibility call with Ethora team to help you choose the right tools and see examples in action.',
      image: IconChat,
    },
    answer: {
      description: [<span>[Book a feasibility call]</span>],
    },
  },
];
