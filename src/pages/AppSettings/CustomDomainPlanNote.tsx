import { NavLink } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import { useAppStore } from '../../store/useAppStore';
import { effectiveAppPlan } from '../../utils/billingPlan';
import { supportContactHref } from '../../utils/suspension';

// The line next to the custom domain field in App Settings. With billing on
// (get-config `billingEnabled`, the hosted service) it follows the App's plan:
//   - Free (or AI Assistant), viewer owns the App: a link to the Billing page
//     for this App, naming the plan that unlocks it, as the Billing page does;
//   - same, viewer is an admin but not the owner: only the owner can buy;
//   - Small Business or Enterprise: included, contact support to connect it.
// With billing off (self-hosted installs) it is the greyed text it always was.
// The domain field itself is not wired to anything yet.

interface Props {
  appId: string;
  // Translation keys of the old greyed text, kept for billing off.
  legacyButtonKey: string;
  legacyUnlockKey: string;
}

export function CustomDomainPlanNote({ appId, legacyButtonKey, legacyUnlockKey }: Props) {
  const { t } = useTranslation();
  const billingEnabled = useAppStore((s) => s.billingEnabled);
  const app = useAppStore((s) => s.apps.find((a) => a._id === appId));
  const currentUser = useAppStore((s) => s.currentUser);
  const supportContact = useAppStore((s) => s.currentApp?.supportContact);

  if (!billingEnabled || !app || app.isBaseApp) {
    return (
      <div className="flex items-center">
        <button className="text-brand-500 font-varela text-[16px] mr-[20px] pointer-events-none text-gray-300 dark:text-gray-500">
          {t(legacyButtonKey)}
        </button>
        <span>{t(legacyUnlockKey)}</span>
      </div>
    );
  }

  const planName = t('adminBilling.plan.small_business.name');
  const plan = effectiveAppPlan(app.billing);

  if (plan === 'small_business' || plan === 'enterprise') {
    const href = supportContactHref(supportContact);
    const linkClass = 'text-brand-500 underline';
    return (
      <div className="font-sans text-[14px]" data-testid="custom-domain-included">
        {t('appSettingsCustomDomain.included')}{' '}
        {href ? (
          <a
            href={href}
            className={linkClass}
            {...(href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
          >
            {t('appSettingsCustomDomain.contactSupport')}
          </a>
        ) : (
          <NavLink to="/app/help" className={linkClass}>
            {t('appSettingsCustomDomain.contactSupport')}
          </NavLink>
        )}
      </div>
    );
  }

  if (app.creatorId && app.creatorId === currentUser?._id) {
    return (
      <div className="flex items-center" data-testid="custom-domain-upgrade">
        <NavLink
          to={`/app/admin/billing?appId=${encodeURIComponent(appId)}`}
          className="text-brand-500 font-varela text-[16px] mr-[20px] hover:underline"
        >
          {t('appSettingsCustomDomain.upgradeTo').replace('{plan}', planName)}
        </NavLink>
        <span>{t('appSettingsCustomDomain.toUnlock')}</span>
      </div>
    );
  }

  return (
    <div className="font-sans text-[14px] text-gray-600" data-testid="custom-domain-owner-only">
      {t('appSettingsCustomDomain.ownerCanUpgrade').replace('{plan}', planName)}
    </div>
  );
}
