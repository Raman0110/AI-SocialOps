import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  createOrganization as createOrganizationRequest,
  login as loginRequest,
  switchOrganization as switchOrganizationRequest,
} from "../../../api/auth";
import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from "../services/authStorage";
import type { AuthSession } from "../types/auth";
import { AuthContext, type AuthContextValue } from "./authContextDefinition";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());

  useEffect(() => {
    const handleUnauthorized = () => {
      clearStoredSession();
      setSession(null);
    };

    window.addEventListener("socialops:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("socialops:unauthorized", handleUnauthorized);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    login: async (input) => {
      clearStoredSession();
      const nextSession = await loginRequest(input);
      setStoredSession(nextSession);
      setSession(nextSession);
    },
    logout: () => {
      clearStoredSession();
      setSession(null);
    },
    switchOrganization: async (organizationId) => {
      const nextSession = await switchOrganizationRequest(organizationId);
      setStoredSession(nextSession);
      setSession(nextSession);
    },
    createOrganization: async (name) => {
      const nextSession = await createOrganizationRequest(name);
      setStoredSession(nextSession);
      setSession(nextSession);
    },
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
