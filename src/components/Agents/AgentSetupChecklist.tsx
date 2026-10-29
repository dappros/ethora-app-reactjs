import classNames from 'classnames';
import { useEffect, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { useAgentKnowledgeCount } from '../../hooks/useAgentKnowledgeCount';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelAgent } from '../../models';
import { useAppStore } from '../../store/useAppStore';
import {
  AGENT_SETUP_CHANGE_EVENT,
  dismissAgentSetup,
  isAgentSetupDismissed,
  isAgentTried,
  isWidgetCodeCopied,
} from '../../utils/agentSetupChecklist';
import { IconClose } from '../Icons/IconClose';
import { AgentBotInstanceRow } from './panels/WebsiteWidgetPanel';

interface Props {
  agent: ModelAgent;
  instances: AgentBotInstanceRow[];
  scopedAppId: string;
  onOpenTab: (tab: 'Web Index' | 'Try it' | 'Website widget') => void;
  refreshKey?: unknown;
}

const widgetUrl = (appId: string) => `/app/admin/apps/${appId}/settings?tab=AI+Widget`;

export const AgentSetupChecklist: React.FC<Props> = ({ agent, instances, scopedAppId, onOpenTab, refreshKey }) => {
  const { t } = useTranslation();
  const ownedApps = useAppStore((s) => s.ownedApps);
  const knowledgeCount = useAgentKnowledgeCount(agent.id, refreshKey);
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    window.addEventListener(AGENT_SETUP_CHANGE_EVENT, rerender);
    window.addEventListener('storage', rerender);
    return () => {
      window.removeEventListener(AGENT_SETUP_CHANGE_EVENT, rerender);
      window.removeEventListener('storage', rerender);
    };
  }, []);

  const ownedIds = new Set((ownedApps || []).map((a) => String(a._id)));
  const widgetAppIds = instances
    .filter((bi) => bi.isAppWidgetBot && ownedIds.has(String(bi.appId)))
    .map((bi) => String(bi.appId));

  const hasKnowledge = (knowledgeCount ?? 0) > 0;
  const tried = isAgentTried(agent.id);
  const copied = widgetAppIds.some(isWidgetCodeCopied);
  const allDone = hasKnowledge && tried && copied;

  if (allDone || isAgentSetupDismissed(agent.id)) return null;

  const widgetTarget = widgetAppIds[0] || scopedAppId;
  const steps = [
    {
      key: 'knowledge',
      done: hasKnowledge,
      warning: knowledgeCount === 0 ? t('agentSetupChecklist.knowledgeWarning') : null,
      action: (
        <button type="button" className="text-brand-500 hover:underline" onClick={() => onOpenTab('Web Index')}>
          {t('agentSetupChecklist.knowledgeAction')}
        </button>
      ),
    },
    {
      key: 'try',
      done: tried,
      warning: null,
      action: (
        <button type="button" className="text-brand-500 hover:underline" onClick={() => onOpenTab('Try it')}>
          {t('agentSetupChecklist.tryAction')}
        </button>
      ),
    },
    {
      key: 'widget',
      done: copied,
      warning: widgetAppIds.length ? null : t('agentSetupChecklist.widgetWarning'),
      action: widgetTarget ? (
        <Link to={widgetUrl(widgetTarget)} className="text-brand-500 hover:underline">
          {t('agentSetupChecklist.widgetAction')}
        </Link>
      ) : (
        <button type="button" className="text-brand-500 hover:underline" onClick={() => onOpenTab('Website widget')}>
          {t('agentSetupChecklist.widgetAction')}
        </button>
      ),
    },
  ] as const;
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <section className="relative mx-4 rounded-xl border border-gray-200 p-4" data-testid="agent-setup-checklist">
      <button
        type="button"
        className="absolute top-3 right-3"
        onClick={() => dismissAgentSetup(agent.id)}
        aria-label={t('agentSetupChecklist.dismiss')}
        title={t('agentSetupChecklist.dismiss')}
      >
        <IconClose />
      </button>
      <div className="flex items-baseline gap-2 pr-8 mb-3">
        <h3 className="font-semibold text-base">{t('agentSetupChecklist.title')}</h3>
        <span className="text-xs text-gray-500">
          {t('agentSetupChecklist.progress').replace('{done}', String(doneCount)).replace('{total}', String(steps.length))}
        </span>
      </div>
      <ol className="grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.key} className="flex gap-3">
            <span
              className={classNames(
                'shrink-0 w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center',
                step.done ? 'bg-brand-500 text-white' : 'border border-gray-300 text-gray-500'
              )}
              aria-hidden
            >
              {step.done ? '✓' : index + 1}
            </span>
            <span className="min-w-0 text-sm">
              <span className={classNames('block font-medium', step.done && 'text-gray-500 line-through')}>
                {t(`agentSetupChecklist.${step.key}Title`)}
              </span>
              {!step.done && <span className="block mt-0.5">{step.action}</span>}
              {!step.done && step.warning && (
                <span className="block mt-1 rounded-md border border-yellow-300 bg-yellow-50 px-2 py-1 text-xs text-yellow-900 dark:border-yellow-800/60 dark:bg-yellow-900/30 dark:text-yellow-200">
                  {step.warning}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
};
