// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// What happens once the login API has handed back a session, shared by the
// password step and the MFA step so both apply it identically.
import type { NavigateFunction } from 'react-router-dom';
import { actionAfterLogin } from '../actions';
import { env } from '../config/env';
import { logLogin } from '../hooks/withTracking.tsx';
import type { ModelApp } from '../models';
import { navigateToUserPage } from './navigateToUserPage';

const ROOT_DOMAIN = String(env.VITE_ROOT_DOMAIN || '').trim();

export function setEthoraUserCookie(value: string) {
  const domainPart =
    ROOT_DOMAIN && ROOT_DOMAIN !== 'localhost' ? `; domain=.${ROOT_DOMAIN}` : '';
  document.cookie = `ethora_user=${value}; path=/${domainPart}; secure; samesite=lax; max-age=604800`;
}

// Where the Account > Security tab lives; the app policy
// (requireMfaForAdmins) sends admins here right after login.
export const SECURITY_TAB_PATH = '/app/account?tab=Security';

// The parts of the login payload this helper looks at; the rest is handed to
// actionAfterLogin untouched.
export interface LoginPayload {
  user?: { _id: string } & Record<string, unknown>;
  mfaEnrolmentRequired?: boolean;
  [key: string]: unknown;
}

export async function finishLogin(
  data: LoginPayload | null | undefined,
  navigate: NavigateFunction,
  config: Pick<ModelApp, 'afterLoginPage'> | null | undefined
) {
  if (!data || !data.user) {
    throw new Error('Invalid response from server');
  }
  await actionAfterLogin(data);
  logLogin('email', data.user._id);
  setEthoraUserCookie('1');

  if (data.mfaEnrolmentRequired) {
    navigate(SECURITY_TAB_PATH);
    return 'mfa-enrolment-required' as const;
  }
  if (config?.afterLoginPage) {
    navigateToUserPage(navigate, config.afterLoginPage as string);
  } else {
    navigate('/');
  }
  return 'done' as const;
}
