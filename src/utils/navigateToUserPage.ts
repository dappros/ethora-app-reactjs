import { NavigateFunction } from 'react-router-dom';
import { defaultLandingPath } from './appHost';

export function navigateToUserPage(
  navigate: NavigateFunction,
  page: string | null | undefined
) {
  if (page === 'login') {
    return navigate('/login');
  }

  switch (page) {
    case 'chats': {
      navigate('/app/chat');
      break;
    }
    case 'profile': {
      navigate('/app/profile');
      break;
    }
    default: {
      navigate(defaultLandingPath());
    }
  }
}
