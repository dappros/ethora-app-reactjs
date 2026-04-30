import { Chat } from '@ethora/chat-component';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import React from 'react';
import { createChatConfig } from '../config/chatBootstrap';
import { useAppStore } from '../store/useAppStore';
import type { ModelApp, ModelCurrentUser } from '../models';

interface ChatComponentProps {
  config: ModelApp | null;
  currentUser: ModelCurrentUser | null;
}

const MemoizedChat = React.memo(function ChatComponent({
  config,
  currentUser,
}: ChatComponentProps) {
  const chatConfig = createChatConfig({
    app: config,
    chatToken: currentUser?.token || null,
  });

  return <Chat config={chatConfig} />;
});

export default function ChatPage() {
  const config = useAppStore((s) => s.currentApp);
  const isAdmin = useAppStore((s) => s.currentApp?.isAllowedNewAppCreate);

  const { currentUser } = useAppStore((s) => s);

  const allowedDomains =
    import.meta.env.VITE_APP_ALLOWED_DOMAINS?.split(',') || [];
  const currentDomain = window.location.hostname;

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full abc">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          Chats
        </div>
        {isAdmin && allowedDomains.includes(currentDomain) && (
          <div className="flex flex-col items-center bg-yellow-100 px-4 py-2 text-sm border">
            <p>This is demo server</p>
            <p className="flex items-center gap-2">
              <span>To test your own App, go to "Admin"</span>
              <ArrowRightAltIcon /> <span>your App </span>
              <ArrowRightAltIcon /> <span>"Publish"</span>
            </p>
          </div>
        )}
        <div />
      </div>
      <div className="rounded-2xl bg-white px-0 overflow-hidden">
        <MemoizedChat config={config} currentUser={currentUser} />
      </div>
    </div>
  );
}
