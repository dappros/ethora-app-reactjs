// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Shared by the evidence list and case view.
import { DateTime } from 'luxon';

export const formatEvidenceTime = (iso?: string | null) => {
  if (!iso) return '';
  const d = DateTime.fromISO(iso);
  return d.isValid ? d.toFormat('dd LLL yyyy t') : '';
};

// Message times with seconds, and the UTC time for the tooltip (the export's
// transcript is in UTC).
export const formatEvidenceSecond = (iso?: string | null) => {
  if (!iso) return { local: '', utc: '' };
  const d = DateTime.fromISO(iso);
  if (!d.isValid) return { local: '', utc: '' };
  return { local: d.toFormat('dd LLL yyyy HH:mm:ss'), utc: `${d.toUTC().toFormat('yyyy-LL-dd HH:mm:ss')} UTC` };
};

export const evidenceListPath = (listSearch?: string | null) => `/app/admin/evidence${listSearch ? `?${listSearch}` : ''}`;

export const evidenceCasePath = (caseId: string, listSearch?: string | null) =>
  `/app/admin/evidence/${encodeURIComponent(caseId)}${listSearch ? `?${listSearch}` : ''}`;
