import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BookACallModal } from '../components/modal/BookACallModal';

// Admin is now a thin shell: just the outlet + the universal support
// footer. Each sub-page (AdminApps, AdminAgents, AdminBilling) owns its
// own page header (title + primary action) - same shape as the Chats
// page, so the sidebar nav is now the only top-level navigation.
export default function Admin() {
  const [showBookACall, setShowBookACall] = useState(false);

  return (
    <div className="grid grid-rows-[1fr,_auto] gap-4 h-full">
      <Outlet />
      <p className="text-xs text-gray-500 text-center pb-2">
        Need assistance?{' '}
        <NavLink to="/app/help" className="text-brand-500 underline">
          Help &amp; Support page
        </NavLink>{' '}
        or{' '}
        <button
          type="button"
          onClick={() => setShowBookACall(true)}
          className="text-brand-500 underline"
        >
          Book a Call
        </button>
        .
      </p>
      {showBookACall && (
        <BookACallModal onClose={() => setShowBookACall(false)} />
      )}
    </div>
  );
}
