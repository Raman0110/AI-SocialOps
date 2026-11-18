import { createContext } from "react";
import type { AuthSession, LoginInput } from "../types/auth";

export interface AuthContextValue {
  session: AuthSession | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  switchOrganization: (organizationId: string) => Promise<void>;
  createOrganization: (name: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
