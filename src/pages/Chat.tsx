import { Chat } from '@ethora/chat-component';
import { useAppStore } from '../store/useAppStore';

export default function ChatPage() {
  const config = useAppStore((s) => s.currentApp);
  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full abc">
      <div className="md:px-8 flex flex-col justify-between items-stretch md:items-center md:flex-row">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          Chats
        </div>
      </div>
      <div className="rounded-2xl bg-white p-4 overflow-hidden">
        <Chat
          config={{
            colors: {
              primary: config?.primaryColor || '#fff',
              secondary: '#fff',
            },
            // @ts-ignore
            roomListStyles: {
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
    </div>
  );
}
