import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { NavLink } from 'react-router-dom';
import { QuestionsType } from './typeTutorial';

export const stepsStartView: {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor?: string;
}[] = [
  {
    title: 'Chat',
    description: 'Talk to our assistant in real-time',
    icon: ChatBubbleOutlineIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
  },
  {
    title: 'AI',
    description: 'Get AI-powered assistance',
    icon: SmartToyOutlinedIcon,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100',
  },
  {
    title: 'Demo',
    description: 'Explore a demo of our features',
    icon: OndemandVideoOutlinedIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
  },
];

export const getQuestionsChat = (query?: string): QuestionsType => [
  {
    id: 'one',
    question: [
      'quickly build a new ',
      <strong key="chat">Chat app</strong>,
      ' for ',
      <strong key="web">Web</strong>,
      ' (using no code or low code if possible)',
    ],
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
          section, then customize the appearance of your application.
        </span>,
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
      images: ['/src/assets/gif/appearance.gif', '/src/assets/gif/webApp.gif'],
    },
  },
  {
    id: 'two',
    question: [
      'quickly build a new ',
      <strong key="chat-ios">Chat app</strong>,
      ' for ',
      <strong key="ios">iOS</strong>,
      ' or ',
      <strong key="android">Android</strong>,
      ' (using no code or low code if possible)',
    ],
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
    id: 'three',
    question: [
      'develop a new app ',
      <strong key="scratch">from scratch</strong>,
      ' or ',
      <strong key="screen">integrate chat screen</strong>,
      ' into my React or Javascript app (using Ethora ',
      <strong key="sdk">SDK NPM</strong>,
      ' component) leveraging Ethora Chat & AI infrastructure',
    ],
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
    question: [
      <strong>..add AI</strong>,
      ' to my no-code web/mobile ',
      <strong>app built with Ethora</strong>,
    ],
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
    question: ['..add AI to my Wordpress website (using a WP plugin)'],
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
    question: [
      '..add AI to my website, web app or enterprise web portal (using a ready widget code)',
    ],
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
    question: [
      'Book a free feasibility call with Ethora team to help you choose the right tools and see examples in action.',
    ],
    answer: {
      description: [<span>[Book a feasibility call]</span>],
    },
  },
];
