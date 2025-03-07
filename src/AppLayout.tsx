import { Suspense } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AppMenu } from './components/AppMenu';
import { useAppStore } from './store/useAppStore';
import { bootstrapChatForFrame } from '../comp/dist/main';


export default function AppLayout() {
  const location = useLocation();
  const user = useAppStore((s) => s.currentUser);
  const currentApp = useAppStore((s) => s.currentApp)

  if (!user) {
    return <Navigate to="/login" replace />;
  }

//   export const VITE_APP_XMPP_SERVICE = import.meta.env.VITE_APP_XMPP_SERVICE;
// export const VITE_XMPP_SERVICE = import.meta.env.VITE_XMPP_SERVICE;
// export const VITE_XMPP_HOST = import.meta.env.VITE_XMPP_HOST;
  let rooms = currentApp?.defaultRooms.map((el) => {
    return {
      title: el.title,
      chatId: el.jid
    }
  })

  bootstrapChatForFrame({
    service: import.meta.env.VITE_APP_XMPP_SERVICE,
    user: {
      xmppPassword: user.xmppPassword,
      // @ts-ignore
      xmppUsername: user.xmppUsername,
      firstName: user.firstName,
      lastName: user.lastName
    },
    canCreateRooms: true,
    canLeaveRooms: true,
    canPostFiles: false,
    isChatListEnabled: true,
    chats: rooms ? rooms : [],
    apiURL: ''
  })

  if (location.pathname !== '/login') {
    localStorage.setItem('lastPath', location.pathname + location.search);
  }

  return (
    <Suspense fallback={null}>
      <div className="bg-gray-100 w-full flex justify-center">
        <div className="h-screen max-w-[1920px] w-full md:p-4">
          {/* app content */}
          <div className="h-full grid grid-rows-[72px,_1fr] md:grid-rows-1 md:grid-cols-[80px,_1fr] md:gap-4">
            {/* menu */}
            <div className="h-full overflow-hidden">
              <AppMenu />
            </div>
            {/* router content */}
            <div className="p-4 min-h-[calc(100vh-72px)] md:p-0">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
