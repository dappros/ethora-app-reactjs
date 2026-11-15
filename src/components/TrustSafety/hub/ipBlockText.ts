// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Text helpers shared by the Blocked IPs tab and the IPs panel of the
// Suspended users tab (docs/TRUST_AND_SAFETY.md section 15).
import { DateTime } from 'luxon';
import { accessErrorMessage } from '../../../utils/accessError';
import { apiError } from '../../../utils/apiError';
import { IpBlockDuration, ipBlockErrorKey } from '../../../utils/tsHub';

type TFn = (key: string) => string;

export const formatIpDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = DateTime.fromISO(iso);
  return d.isValid ? d.toFormat('dd LLL yyyy t') : '';
};

/** A friendly message for a failed block: the known codes, else the API's text. */
export function ipBlockErrorMessage(e: unknown, t: TFn): string {
  const key = ipBlockErrorKey(apiError(e, '').code);
  return key ? t(key) : accessErrorMessage(e, t);
}

export function durationLabel(days: IpBlockDuration, t: TFn): string {
  return days === 0
    ? t('tsHub.ipBlocks.permanent')
    : t('tsHub.ipBlocks.days').replace('{count}', String(days));
}
