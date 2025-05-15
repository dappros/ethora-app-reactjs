import { NavigateFunction } from 'react-router-dom';

export function navigateToUserPage(
  navigate: NavigateFunction,
  page: string | null | undefined
) {
  console.log('page', page);
  if (page === 'chats') {
    return navigate('/app/chat');
  } else if (page?.includes('admin')) {
    navigate('/app/admin/apps');
  } else if (page && page !== '/login') {
    navigate(page);
  } else {
    navigate('/app/admin/apps');
  }
  // switch (page) {
  //     case 'chats': {
  //       navigate("/app/chat")
  //       break
  //     }
  //     case 'profile': {
  //       navigate("/app/profile")
  //       break
  //     }
  //     default: {
  //       navigate("/app/admin/apps")
  //     }
  //   }
}
