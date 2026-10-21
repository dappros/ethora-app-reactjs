import { NavigateFunction } from 'react-router-dom';
import { defaultLandingPath } from './appHost';
import { consumeReturnPath } from './returnPath';

export function navigateToUserPage(
  navigate: NavigateFunction,
  page: string | null | undefined
) {
  if (page === 'login') {
    return navigate('/login');
  }

  // A join link opened while signed out: land back on it, not on the app's
  // configured landing page. Every login path ends here.
  const returnPath = consumeReturnPath();
  if (returnPath) {
    return navigate(returnPath, { replace: true });
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
