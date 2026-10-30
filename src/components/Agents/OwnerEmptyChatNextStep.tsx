import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { httpListBotInstances } from '../../http';
import { useAgentKnowledgeCount } from '../../hooks/useAgentKnowledgeCount';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelBotInstance } from '../../models';

const BANNER_CLASS =
  'bg-yellow-100 dark:bg-yellow-900/30 dark:border-yellow-900/60 px-4 py-2 text-sm border max-w-[640px]';

const agentTabUrl = (agentId: string, tab: 'Web+Index' | 'Try+it') =>
  `/app/admin/agents/${agentId}/settings?tab=${tab}`;

export const OwnerEmptyChatNextStep = ({ appId }: { appId: string }) => {
  const { t } = useTranslation();
  const [agentId, setAgentId] = useState<string | null | undefined>(undefined);
  const knowledgeCount = useAgentKnowledgeCount(agentId);

  useEffect(() => {
    let cancelled = false;
    setAgentId(undefined);
    httpListBotInstances({ appId })
      .then((r) => {
        if (cancelled) return;
        const items: ModelBotInstance[] = r.data?.items || [];
        const instance = items.find((bi) => bi.status === 'on') || items[0];
        setAgentId(instance?.agentId || null);
      })
      .catch(() => {
        if (!cancelled) setAgentId(null);
      });
    return () => {
      cancelled = true;
    };
  }, [appId]);

  const chatsLink = (
    <NavLink to={`/app/admin/apps/${appId}/settings?tab=Chats`} className="text-brand-500 underline">
      {t('chat.noChatsBanner.linkText')}
    </NavLink>
  );

  if (agentId === undefined) return null;

  if (agentId === null) {
    return (
      <div className={BANNER_CLASS}>
        {t('chat.noChatsBanner.prefix')}
        {chatsLink}
        {t('chat.noChatsBanner.suffix')}
      </div>
    );
  }

  const needsKnowledge = knowledgeCount === 0;

  return (
    <div className={BANNER_CLASS} data-testid="owner-empty-chat-next-step">
      {t('chat.nextStep.prefix')}
      <NavLink
        to={agentTabUrl(agentId, needsKnowledge ? 'Web+Index' : 'Try+it')}
        className="text-brand-500 underline font-medium"
      >
        {t(needsKnowledge ? 'chat.nextStep.addKnowledge' : 'chat.nextStep.testAgent')}
      </NavLink>
      {t('chat.nextStep.orChats')}
      {chatsLink}
      .
    </div>
  );
};
