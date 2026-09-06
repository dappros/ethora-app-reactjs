const BASE_SUBDOMAIN = (import.meta.env.VITE_DOMAIN_NAME || 'app')
  .trim()
  .toLowerCase();

function isLocalHostname(host: string): boolean {
  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host === '[::1]' ||
    /^\d+\.\d+\.\d+\.\d+$/.test(host)
  );
}

export function isBaseAppHost(
  hostname: string = typeof window === 'undefined'
    ? ''
    : window.location.hostname
): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, '');
  if (!host) return false;
  if (isLocalHostname(host)) return true;

  const [subdomain] = host.split('.');
  return subdomain === BASE_SUBDOMAIN;
}

export function defaultLandingPath(): string {
  return isBaseAppHost() ? '/app/admin/apps' : '/app/chat';
}
