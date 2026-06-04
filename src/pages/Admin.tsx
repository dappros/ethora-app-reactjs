import cn from 'classnames';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BookACallModal } from '../components/modal/BookACallModal';

export default function Admin() {
  const [showBookACall, setShowBookACall] = useState(false);
  const isProd = import.meta.env.VITE_SITE_IS_PRODUCTION;
  // AI feature umbrella from deploy.yml -> features.ai_service. Surfaced to the
  // frontend via VITE_AI_FEATURE_ENABLED. When false, the Agents tab below
  // greys out (same shape as the Billing tab disable on non-prod).
  const aiEnabled = import.meta.env.VITE_AI_FEATURE_ENABLED === 'true';

  return (
    <div className="grid grid-rows-[auto,_1fr,_auto] gap-4 h-full">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          Admin
        </div>
        {/* Three top-level admin sections: Apps | Agents | Billing.
            Apps and Billing are pre-existing; Agents is the new tenant-scope page for
            managing AI Agents that get deployed across many Apps. Agents disables
            (greys out, non-clickable) when this install does not ship AI features. */}
        <div className="w-full max-w-[520px] h-[40px] flex justify-between">
          <NavLink
            className={({ isActive }) =>
              cn(
                'w-1/3 border flex items-center hover:bg-brand-darker justify-center rounded-l-xl border-brand-500 font-sans text-base',
                {
                  'bg-brand-500 text-white': isActive,
                  'hover:bg-brand-hover': !isActive,
                }
              )
            }
            to="/app/admin/apps"
          >
            Apps
          </NavLink>
          <NavLink
            title={aiEnabled ? undefined : 'AI features are not enabled in this deployment'}
            className={({ isActive }) =>
              cn(
                'w-1/3 border-y border-r flex items-center hover:bg-brand-darker justify-center border-brand-500 font-sans text-base',
                {
                  'bg-brand-500 text-white': isActive && aiEnabled,
                  'hover:bg-brand-hover': !isActive && aiEnabled,
                  'cursor-not-allowed pointer-events-none text-gray-300 border-gray-300':
                    !aiEnabled,
                }
              )
            }
            to="/app/admin/agents"
          >
            Agents
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              cn(
                'w-1/3 border-y border-r flex items-center justify-center rounded-r-xl border-brand-500 font-sans text-base',
                {
                  'bg-brand-500 text-white': isActive,
                  'hover:bg-brand-hover': !isActive,
                  'cursor-not-allowed pointer-events-none text-gray-300 border-gray-300':
                    isProd === 'true',
                }
              )
            }
            to="/app/admin/billing"
          >
            Billing
          </NavLink>
        </div>
      </div>
      <div
        id="admin"
        className="rounded-2xl bg-white p-4 grid grid-rows-[auto,_1fr]"
      >
        <Outlet />
      </div>
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
