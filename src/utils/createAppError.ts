// "Create App" refused because the account has no access record on its App:
// a sign-up interrupted by a chat server outage left it incomplete. Signing
// in again completes the account (API accountRepair.service), so the message
// says that instead of the raw "Not found userAcl".
export function isAccountIncompleteError(e: unknown): boolean {
  const data = (e as { response?: { data?: { error?: string; code?: string } } })?.response?.data;
  return data?.code === 'ACCOUNT_INCOMPLETE' || data?.error === 'Not found userAcl';
}
