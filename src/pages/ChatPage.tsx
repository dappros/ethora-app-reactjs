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
      <div
        className="app-content-body"
        style={{
          height: 'calc(100% - 56px)',
          padding: 0,
        }}
      >
        <Outlet />
        <Chat
          config={{
            colors: {
              primary: config?.primaryColor || '#fff',
              secondary: '#fff',
            },
            roomListStiles: {
              color: config?.primaryColor,
              maxHeight: 'calc(100%)',
              height: 'calc(100%)',
              borderRadius: '16px 0px 0px 16px',
              maxWidth: 432,
            },
            chatRoomStyles: {
              color: config?.primaryColor,
              maxHeight: 'calc(100%)',
              height: 'calc(100%)',
              borderRadius: '0px 16px 16px 0px',
            },
            // setRoomJidInPath: true,
          }}
          MainComponentStyles={{
            color: 'white',
            maxHeight: 'calc(100%)',
            height: 'calc(100%)',
            borderRadius: 16,
          }}
        />
      </div>
    </>
  );
}
