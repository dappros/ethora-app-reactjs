export function isAllowedDomain(hostname: string): boolean {
  const current = String(hostname || '').trim().toLowerCase();
  if (!current) {
    return false;
  }

  const allowedDomains = String(import.meta.env.VITE_APP_ALLOWED_DOMAINS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (allowedDomains.includes(current)) {
    return true;
  }

  const hostedAppsRoot = String(
    import.meta.env.VITE_HOSTED_APPS_ROOT_DOMAIN || ''
  )
    .trim()
    .toLowerCase();

  return Boolean(
    hostedAppsRoot &&
      current !== hostedAppsRoot &&
      current.endsWith(`.${hostedAppsRoot}`)
  );
}
