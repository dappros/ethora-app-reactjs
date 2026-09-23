import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
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
      <p className="text-xs text-gray-500 text-center pb-2">
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
      {showBookACall && (
        <BookACallModal onClose={() => setShowBookACall(false)} />
      )}
    </div>
  );
}
