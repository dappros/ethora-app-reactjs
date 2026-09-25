import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { EditionFooter } from '../components/EditionFooter';
import { BookACallModal } from '../components/modal/BookACallModal';
import { useTranslation } from '../i18n/useTranslation';

// Admin is now a thin shell: just the outlet + the universal support
// footer. Each sub-page (AdminApps, AdminAgents, AdminBilling) owns its
// own page header (title + primary action) - same shape as the Chats
// page, so the sidebar nav is now the only top-level navigation.
export default function Admin() {
  const [showBookACall, setShowBookACall] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="grid grid-rows-[1fr,_auto] gap-4 h-full">
      <Outlet />
      <div className="text-xs text-gray-500 pb-2 flex flex-col items-center gap-1 md:grid md:grid-cols-[1fr,auto,1fr] md:items-center">
        <span className="hidden md:block" />
        <p className="text-center">
        <NavLink to="/app/help" className="text-brand-500 underline">
          {t('adminShell.helpSupportPage')}
        </NavLink>
        {' | '}
        {/* The MCP route is the "skip the admin panel" path: an assistant
            connected once can do most of what these pages do. */}
        <NavLink
          to="/app/account?tab=AI%20Assistants"
          className="text-brand-500 underline"
        >
          {t('adminShell.connectMcp')}
        </NavLink>
        {' | '}
        <button
          type="button"
          onClick={() => setShowBookACall(true)}
          className="text-brand-500 underline"
        >
          {t('adminShell.bookACall')}
        </button>
        </p>
        <EditionFooter className="md:justify-self-end md:text-right md:pr-2" />
      </div>
      {showBookACall && (
        <BookACallModal onClose={() => setShowBookACall(false)} />
      )}
    </div>
  );
}
