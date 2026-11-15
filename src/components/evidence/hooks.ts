// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Hooks shared by the evidence pages.
import { useCallback } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { useAppStore } from '../../store/useAppStore';

// Evidence review is for server superadmins with write access
// (isSuperAdmin.write). The API enforces the same rule.
export function useCanReviewEvidence() {
  const currentUser = useAppStore((s) => s.currentUser);
  return Boolean(currentUser?.isSuperAdmin?.write);
}

// Label of an enum value ('evidence.reason', 'deleted'); a missing
// translation falls back to the raw value.
export function useEvidenceLabel() {
  const { t } = useTranslation();
  return useCallback(
    (prefix: string, value?: string | null) => {
      if (!value) return '';
      const key = `${prefix}.${value}`;
      const v = t(key);
      return v === key ? value : v;
    },
    [t]
  );
}
