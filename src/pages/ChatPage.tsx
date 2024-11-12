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
      {/* app-content-body */}
      <div className="bg-white rounded-2xl md:ml-[96px] p-4 w-full md:w-[calc(100vw-166px)]">
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
          }}
        />
      </div>
    </>
  );
}
