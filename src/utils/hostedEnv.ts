// True on Ethora's own hosted service (chat.ethora.com, chat-qa.ethora.com
// and their tenant subdomains). Copy written for the hosted demo (billing,
// "our demo base app") is shown only there; self-hosted and enterprise
// installs get wording about their own server.
export function isEthoraHostedEnv(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (
    host === 'chat.ethora.com' ||
    host === 'chat-qa.ethora.com' ||
    host.endsWith('.chat.ethora.com') ||
    host.endsWith('.chat-qa.ethora.com')
  );
}
