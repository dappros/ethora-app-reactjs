import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from '../../../i18n/useTranslation';
import { useAppStore } from '../../../store/useAppStore';
import Register from '.';

/**
 * Route guard for `/register`, so a deep link cannot reach the sign-up flow
 * on an app whose owner has closed self-service registration. The hidden
 * "Sign Up" link on the login page is UX; this is the client-side half of the
 * same UX. The real control is server-side (403 REGISTRATION_DISABLED).
 *
 * Deliberately scoped to `/register` only: `/tempPassword/` renders the same
 * Register component, and that flow belongs to a user the owner provisioned
 * themselves - closing registration must not lock those users out of setting
 * their password.
 *
 * `App` renders a loader until the app config resolves, so `currentApp` is
 * populated by the time this mounts.
 */
export default function RegistrationOpenRoute() {
  const registrationClosed = useAppStore((s) =>
    Boolean(s.currentApp?.userRegistrationDisabled)
  );
  const { t } = useTranslation();

  useEffect(() => {
    if (registrationClosed) {
      toast.info(t('authRegistrationClosed.notice'));
    }
  }, [registrationClosed, t]);

  if (registrationClosed) {
    return <Navigate to="/login" replace />;
  }

  return <Register />;
}
