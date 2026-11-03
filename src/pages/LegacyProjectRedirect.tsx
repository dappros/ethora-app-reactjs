import { Navigate, useParams, useSearchParams } from 'react-router-dom';

export default function LegacyProjectRedirect({ section }: { section: 'assistant' | 'widget' }) {
  const { appId } = useParams();
  const [params] = useSearchParams();
  const destination = section === 'widget' && params.get('tab') === 'ai' ? 'assistant' : section;
  const tab = destination === 'widget' && ['install', 'appearance', 'conversations'].includes(params.get('tab') || '')
    ? `?tab=${params.get('tab')}` : '';
  return <Navigate to={`/app/admin/apps/${appId}/${destination}${tab}`} replace />;
}
