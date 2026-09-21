// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Pulls the `{ error, code }` envelope out of a failed axios call without
// the caller having to type the rejection as `any`.
import { isAxiosError } from 'axios';

export interface ApiErrorInfo {
  code?: string;
  message: string;
  status?: number;
}

export function apiError(e: unknown, fallback = 'Request failed'): ApiErrorInfo {
  if (isAxiosError(e)) {
    const data = e.response?.data as { error?: string; code?: string } | undefined;
    return {
      code: data?.code,
      message: data?.error || e.message || fallback,
      status: e.response?.status,
    };
  }
  if (e instanceof Error) return { message: e.message || fallback };
  return { message: fallback };
}
