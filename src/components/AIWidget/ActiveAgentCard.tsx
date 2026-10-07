import { FormControlLabel, Switch } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import { useActiveWidgetAgent } from '../../hooks/useActiveWidgetAgent';
import { useAppStore } from '../../store/useAppStore';
import { ModelApp } from '../../models';
import { ActiveAgentSelector } from './ActiveAgentSelector';

interface Props {
  appId: string;
  app?: ModelApp;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  conversationsTotal: number | null;
  // Knowledge readout for Apps still on the legacy per-App bot (MB), used
  // when no agent is bound.
  legacyKnowledgeMb?: string | null;
}

function formatMb(bytes?: number | null): string | null {
  if (!bytes || bytes <= 0) return null;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Everything about the agent behind this App's website widget in one place:
// which agent, who it is, whether it answers, and what it knows.
export const ActiveAgentCard: React.FC<Props> = ({
  appId,
  app,
  enabled,
  onToggle,
  disabled = false,
  conversationsTotal,
  legacyKnowledgeMb,
}) => {
  const { t } = useTranslation();
  const agent = useActiveWidgetAgent(app);
  const currentUserId = useAppStore((s) => (s.currentUser as { _id?: string } | null)?._id);
  // A public agent of someone else (the Support Agent above all) opens read
  // only; it is changed by cloning it under Agents.
  const ownsAgent = !!agent && !!currentUserId && String(agent.ownerId) === String(currentUserId);
  const knowledge = agent ? formatMb(agent.totalSiteSourceSize) : legacyKnowledgeMb ? `${legacyKnowledgeMb} MB` : null;
  const settingsUrl = agent ? `/app/admin/agents/${agent.id}/settings` : null;

  return (
    <section className="border border-gray-200 rounded-xl bg-white p-4" data-testid="ai-agent-card">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="font-sans font-semibold text-base">{t('aiWidgetAgentCard.title')}</h3>
        <Link to="/app/admin/agents" className="text-brand-500 hover:underline text-sm">
          {t('aiWidgetActiveAgentSelector.manageAgents')}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {agent ? (
          agent.avatarUrl ? (
            <img
              src={agent.avatarUrl}
              alt=""
              className="w-12 h-12 rounded-full object-cover bg-gray-200 shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 dark:text-brand-300 flex items-center justify-center font-semibold shrink-0">
              {agent.displayName.slice(0, 2).toUpperCase()}
            </div>
          )
        ) : null}
        <div className="flex-1 min-w-[14rem]">
          <ActiveAgentSelector appId={appId} app={app} bare disabled={disabled} label={t('aiWidgetAgentCard.pickLabel')} />
          {agent?.bio && <div className="text-xs text-gray-500 mt-1 line-clamp-2">{agent.bio}</div>}
          {!agent && <div className="text-xs text-gray-500 mt-1">{t('aiWidgetAgentCard.noAgent')}</div>}
        </div>
        {settingsUrl && (
          <Link to={settingsUrl} className="text-brand-500 hover:underline text-sm shrink-0">
            {ownsAgent ? t('aiWidgetAgentCard.editAgent') : t('aiWidgetAgentCard.viewAgent')}
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 pt-3 border-t border-gray-100 text-sm font-sans">
        <FormControlLabel
          sx={{ m: 0 }}
          control={<Switch size="small" checked={enabled} onChange={onToggle} disabled={disabled} />}
          label={<span>{enabled ? t('aiWidgetAgentCard.answering') : t('aiWidgetAgentCard.paused')}</span>}
        />
        <div className="text-gray-700">
          <span className="font-semibold">{t('aiWidgetAgentCard.knowledge')}</span>{' '}
          {knowledge ? (
            knowledge
          ) : settingsUrl && ownsAgent ? (
            <Link to={`${settingsUrl}?tab=Web+Index`} className="text-brand-500 hover:underline">
              {t('aiWidgetAgentCard.addKnowledge')}
            </Link>
          ) : (
            t('appSettingsAIWidget.ragEmpty')
          )}
        </div>
        <div className="text-gray-700">
          <span className="font-semibold">{t('appSettingsAIWidget.conversationsLabel')}</span>{' '}
          {conversationsTotal === null ? '-' : conversationsTotal}
        </div>
      </div>
    </section>
  );
};
