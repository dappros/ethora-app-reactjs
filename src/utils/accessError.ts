import { apiError } from './apiError';

type TFn = (key: string) => string;

export function isForbidden(error: unknown): boolean {
  return apiError(error).status === 403;
}

export function accessErrorMessage(error: unknown, t: TFn): string {
  const info = apiError(error);
  // An incomplete account (see utils/createAppError.ts) is not a permission
  // matter: the API client already put the readable message in place.
  if (info.code === 'ACCOUNT_INCOMPLETE') return info.message;
  return isForbidden(error) ? t('accessError.noPermission') : info.message;
}
