import type { AuthSession } from "../types/auth";

const SESSION_KEY = "socialops.auth.session";

export function getStoredSession(): AuthSession | null {
  const value = window.localStorage.getItem(SESSION_KEY);

  if (!value) return null;

  try {
    const session = JSON.parse(value) as AuthSession;

    if (!session.accessToken || new Date(session.expiresAtUtc).getTime() <= Date.now()) {
      clearStoredSession();
      return null;
    }

    return session;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function setStoredSession(session: AuthSession): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
}

export function getAccessToken(): string | null {
  return getStoredSession()?.accessToken ?? null;
}
