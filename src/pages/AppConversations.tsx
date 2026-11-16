import { useParams } from 'react-router-dom';
import { WidgetConversationsPanel } from '../components/AIWidget/WidgetConversationsPanel';

// Website visitor conversations of the App, a tab of its own (formerly at the
// bottom of Settings > AI Widget).
export default function AppConversations() {
  const { appId } = useParams();
  if (!appId) return null;
  return <WidgetConversationsPanel appId={appId} />;
}
