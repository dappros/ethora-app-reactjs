import { Link } from 'react-router-dom';
import { useTranslation } from '../../../i18n/useTranslation';
import { ModelAgent, ModelBotInstance } from '../../../models';
import { useAppStore } from '../../../store/useAppStore';

export type AgentBotInstanceRow = ModelBotInstance & { appName?: string; isAppWidgetBot?: boolean };

// The widget's look belongs to the App it is embedded for, not to the agent:
// one agent can answer on several Apps' sites, each with its own appearance.
// So this tab only points at the Apps whose website widget this agent backs,
// limited to Apps the viewer owns (a public agent's bots in other accounts'
// Apps are none of their business and not editable by them).
export const WebsiteWidgetPanel: React.FC<{ agent: ModelAgent; instances: AgentBotInstanceRow[] }> = ({
  agent,
  instances,
}) => {
  const { t } = useTranslation();
  const ownedApps = useAppStore((s) => s.ownedApps);
  const ownedIds = new Set((ownedApps || []).map((a) => String(a._id)));
  const rows = instances.filter((bi) => bi.isAppWidgetBot && ownedIds.has(String(bi.appId)));

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-1">{t('agentSettings.websiteWidgetHeading')}</h3>
        <p className="text-sm text-gray-600">{t('agentSettings.websiteWidgetIntro')}</p>
      </div>

      {rows.length ? (
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200" data-testid="website-widget-apps">
          {rows.map((bi) => (
            <li key={bi.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{bi.appName || bi.appId}</div>
                <div className="text-xs text-gray-500">
                  {bi.status === 'on' ? t('agentSettings.websiteWidgetBotOn') : t('agentSettings.websiteWidgetBotOff')}
                </div>
              </div>
              <Link
                to={`/app/admin/apps/${bi.appId}/settings?tab=AI+Widget`}
                className="text-brand-500 hover:underline text-sm"
              >
                {t('agentSettings.websiteWidgetOpen')}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600">
          {t('agentSettings.websiteWidgetEmpty').replace('{name}', agent.displayName || '')}
        </div>
      )}
    </div>
  );
};
