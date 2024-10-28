import { Chat } from '@ethora/chat-component';
import { Outlet } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export function ChatPage() {
  const config = useAppStore((s) => s.currentApp);

  return (
    <>
      <div className="app-content-header">
        <div className="app-content-header-title">Chats</div>
      </div>
      <div className="app-content-body">
        <Outlet />
        <Chat
          config={{
            colors: {
              primary: config?.primaryColor || '#fff',
              secondary: config?.primaryColor || '#fff',
            },
            disableMedia: true,
            disableRooms: true,
          }}
          roomJID={
            '5f9a4603b2b5bbfa6b228b642127c56d03b778ad594c52b755e605c977303979@conference.xmpp.ethoradev.com'
          }
          MainComponentStyles={{
            color: 'white',
            maxHeight: '768px',
          }}
        />
      </div>
    </>
  );
}
