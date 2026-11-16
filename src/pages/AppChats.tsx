import { useParams } from 'react-router-dom';
import ChatPage from './Chat';

// The App's chats inside its own page, under the App header and tabs.
export default function AppChats() {
  const { appId } = useParams();
  if (!appId) return null;
  return <ChatPage embeddedAppId={appId} />;
}
