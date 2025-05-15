import { NavigateFunction } from "react-router-dom";

export function navigateToUserPage(navigate: NavigateFunction, page: string | null | undefined) {
  console.log("page" , page);
  if(page === 'admin') {
    return navigate("/admin");
  }

  switch (page) {
    case 'chats': {
      navigate("/app/chat");
      break;
    }
    case 'profile': {
      navigate("/app/profile");
      break;
    }
    default: {
      navigate("/app/admin/apps");
    }
  }
}