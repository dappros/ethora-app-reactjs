// Direct-API auth helpers for diagnostic scripts. Skips the UI signup
// flow (faster, more reliable, and gives us a known set of credentials
// to use afterwards in either the UI or further API calls).
//
// Usage:
//
//   import { signup, login } from './lib/auth.mjs';
//   const email = `test${Date.now()}@test.ethora.com`;
//   await signup({ apiBase, appId, email, password: 'TestPass123!' });
//   const { token, refreshToken, user } = await login({ apiBase, appId, email, password });
//
// Both throw on non-2xx responses with the body included so failures
// don't surface as silent JSON parse errors.

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`POST ${url} -> ${res.status}: ${text.slice(0, 500)}`);
  try { return JSON.parse(text); } catch { return text; }
}

export async function signup({ apiBase, appId, email, password, firstName = 'Test', lastName = 'User' }) {
  return await postJson(`${apiBase}/v2/users/sign-up-with-email`, {
    appId, email, password, firstName, lastName, cfToken: '',
  });
}

export async function login({ apiBase, appId, email, password }) {
  return await postJson(`${apiBase}/v2/users/login-with-email`, { appId, email, password });
}

// Convenience: sign up if the email is new, otherwise just log in.
// Useful for re-running a probe without stale state.
export async function signupOrLogin({ apiBase, appId, email, password, firstName, lastName }) {
  try {
    await signup({ apiBase, appId, email, password, firstName, lastName });
  } catch (e) {
    if (!/already exists|USER_ALREADY_EXISTS/i.test(e.message || '')) throw e;
  }
  return await login({ apiBase, appId, email, password });
}
