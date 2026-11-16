// The welcome image is an uploaded file served by the install's file
// storage. Self-hosted installs often run on plain http, so both http and
// https are accepted; any other scheme (data:, javascript:, blob:, ...) is
// refused, and so is a relative location: the API stores absolute URLs only.
export function isWebImageUrl(value: string | undefined | null): boolean {
  if (!value) return false;
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}
