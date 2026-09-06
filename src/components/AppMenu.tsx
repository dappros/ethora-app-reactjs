import cn from 'classnames';
import { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store/useAppStore';
import { isBaseAppHost } from '../utils/appHost';
import { IconAccount } from './Icons/IconAccount';
import { IconAdmin } from './Icons/IconAdmin';
import { IconAgents } from './Icons/IconAgents';
import { IconBilling } from './Icons/IconBilling';
import { IconChat } from './Icons/IconChat';
import { IconHelp } from './Icons/IconHelp';
import { IconMenuBurger } from './Icons/IconMenuBurger';
import { MobileMenuModal } from './modal/MobileMenuModal';
import { ProfilePageUserIcon } from './ProfilePageUserIcon';
import { UnreadBadge } from './UnreadBadge';

const ITEM_CLASS =
  'flex group hover:bg-[#F5F7F9] flex-col items-center justify-center w-[80px] h-[64px] px-1 rounded-xl aria-[current=page]:bg-brand-150';
const LABEL_CLASS =
  'text-center font-sans text-xs max-w-full truncate group-aria-[current=page]:text-brand-500';
const ITEM_WRAP_CLASS = 'py-[3px] first:pt-0 last:pb-0';

// Billing surfaces a "You're on a Free plan" copy that's specific to our
// hosted SaaS (chat.ethora.com and chat-qa.ethora.com). Enterprise / self-
// hosted customers shouldn't see it - it would imply an Ethora-Inc billing
// relationship that doesn't apply to their install. Hide the icon and link
// in the sidebar unless the host is one of ours; the route itself stays so
// internal tooling that deep-links keeps working.
function isEthoraHostedEnv(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (
    host === 'chat.ethora.com' ||
    host === 'chat-qa.ethora.com' ||
    host.endsWith('.chat.ethora.com') ||
    host.endsWith('.chat-qa.ethora.com')
  );
}

export function AppMenu() {
  const location = useLocation();
  const [isMobileMenuVisible, setMobileMenuVisible] = useState(false);
  const { t } = useTranslation();
  const currentUser = useAppStore((s) => s.currentUser);
  const isAdmin = useAppStore((s) => s.currentApp?.isAllowedNewAppCreate);
  const aiEnabled = import.meta.env.VITE_AI_FEATURE_ENABLED === 'true';
  // Apps / Agents / Billing / Help belong to the base app (app.<root>). An app
  // created inside it is served from its own subdomain and shows chat only.
  const isBaseApp = isBaseAppHost();
  const showBilling = isBaseApp && isEthoraHostedEnv();

  const getPageTitle = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);

    if (parts.length > 1) {
      return parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    }

    return 'Ethora';
  }, [location.pathname]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="bg-white md:fixed p-2 flex justify-between items-center h-full md:h-[calc(100vh-32px)] md:rounded-2xl md:self-start md:flex-col">
      <button
        onClick={() => setMobileMenuVisible(!isMobileMenuVisible)}
        className="md:hidden"
      >
        <IconMenuBurger />
      </button>
      <div className="font-varela text-[24px] leading-none md:hidden block">
        {getPageTitle}
      </div>
      <div className="hidden md:flex flex-col divide-y divide-gray-100">
        {isAdmin && isBaseApp && (
          <div className={ITEM_WRAP_CLASS}>
            <NavLink to="/app/admin/apps" className={ITEM_CLASS}>
              <IconAdmin />
              <div className={LABEL_CLASS}>{t('nav.apps')}</div>
            </NavLink>
          </div>
        )}
        <div className={ITEM_WRAP_CLASS}>
          <NavLink to="/app/chat" className={ITEM_CLASS}>
            <div className="relative">
              <IconChat />
              <UnreadBadge className="absolute -top-1 -right-2" />
            </div>
            <div className={LABEL_CLASS}>{t('nav.chats')}</div>
          </NavLink>
        </div>
        {isAdmin && isBaseApp && (
          <div className={ITEM_WRAP_CLASS}>
            <NavLink
              to="/app/admin/agents"
              title={
                aiEnabled
                  ? undefined
                  : 'AI features are not enabled in this deployment'
              }
              className={cn(ITEM_CLASS, {
                'cursor-not-allowed pointer-events-none opacity-50': !aiEnabled,
              })}
            >
              <IconAgents />
              <div className={LABEL_CLASS}>{t('nav.agents')}</div>
            </NavLink>
          </div>
        )}
        {isAdmin && showBilling && (
          <div className={ITEM_WRAP_CLASS}>
            <NavLink to="/app/admin/billing" className={ITEM_CLASS}>
              <IconBilling />
              <div className={LABEL_CLASS}>{t('nav.billing')}</div>
            </NavLink>
          </div>
        )}
        {isBaseApp && (
          <div className={ITEM_WRAP_CLASS}>
            <NavLink to="/app/help" className={ITEM_CLASS}>
              <IconHelp />
              <div className={LABEL_CLASS}>{t('nav.help')}</div>
            </NavLink>
          </div>
        )}
      </div>
      <div className="md:divide-y md:divide-gray-100">
        <div className={ITEM_WRAP_CLASS}>
          <NavLink
            to="/app/profile"
            className="flex hover:bg-[#F5F7F9] group flex-col items-center justify-center md:w-[80px] md:h-[64px] md:px-1 rounded-xl aria-[current=page]:bg-brand-150"
          >
            <ProfilePageUserIcon
              firstName={currentUser.firstName}
              lastName={currentUser.lastName}
              profileImage={currentUser.profileImage}
              width="40px"
              height="40px"
              className="border border-brand-500 rounded-full"
              small={true}
            />
            <div className="hidden md:block group-aria-[current=page]:text-brand-500 text-center font-sans text-xs max-w-full truncate">
              {t('nav.profile')}
            </div>
          </NavLink>
        </div>
        <div className={cn(ITEM_WRAP_CLASS, 'hidden md:block')}>
          <NavLink
            to="/app/account"
            className="hidden group hover:bg-[#F5F7F9] flex-col items-center justify-center md:flex md:w-[80px] md:h-[64px] md:px-1 rounded-xl aria-[current=page]:bg-brand-150"
          >
            <IconAccount />
            <div className="hidden md:block text-center font-sans text-xs max-w-full truncate group-aria-[current=page]:text-brand-500">
              {t('nav.account')}
            </div>
          </NavLink>
        </div>
      </div>
      {isMobileMenuVisible && (
        <MobileMenuModal
          isAdmin={isAdmin && isBaseApp}
          onClose={() => setMobileMenuVisible(false)}
        />
      )}
    </div>
  );
}
