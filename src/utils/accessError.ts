import { apiError } from './apiError';

type TFn = (key: string) => string;

export function isForbidden(error: unknown): boolean {
  return apiError(error).status === 403;
}

export function accessErrorMessage(error: unknown, t: TFn): string {
  return isForbidden(error) ? t('accessError.noPermission') : apiError(error).message;
}
