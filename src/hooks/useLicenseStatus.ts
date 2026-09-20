import { useCallback, useEffect, useState } from 'react';
import { httpV2 } from '../http';
import type { LicenseStatus } from '../models';

// One fetch shared by the banner and the License page. Module-level cache so
// navigating between admin pages does not refetch, with a refresh() for after
// a key upload. Errors are swallowed: a failed status read must never break
// the UI, the backend already enforces whatever the state is.
let cached: LicenseStatus | null = null;
let inflight: Promise<LicenseStatus | null> | null = null;
const listeners = new Set<(s: LicenseStatus | null) => void>();

function publish(s: LicenseStatus | null) {
  cached = s;
  listeners.forEach((fn) => fn(s));
}

export async function fetchLicenseStatus(): Promise<LicenseStatus | null> {
  if (inflight) return inflight;
  inflight = httpV2
    .get<{ license: LicenseStatus }>('/license')
    .then((r) => r.data?.license ?? null)
    .catch(() => null)
    .then((s) => {
      inflight = null;
      publish(s);
      return s;
    });
  return inflight;
}

export function setLicenseStatus(s: LicenseStatus | null) {
  publish(s);
}

export function useLicenseStatus() {
  const [status, setStatus] = useState<LicenseStatus | null>(cached);

  useEffect(() => {
    listeners.add(setStatus);
    if (!cached) fetchLicenseStatus();
    return () => {
      listeners.delete(setStatus);
    };
  }, []);

  const refresh = useCallback(() => {
    cached = null;
    return fetchLicenseStatus();
  }, []);

  return { status, refresh };
}
