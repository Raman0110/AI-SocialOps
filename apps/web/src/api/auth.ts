import type { AuthSession, LoginInput } from "../modules/auth/types/auth";
import { request } from "./client";

export function login(input: LoginInput): Promise<AuthSession> {
  return request<AuthSession>({
    method: "POST",
    url: "/api/auth/login",
    data: input,
  });
}

export function switchOrganization(organizationId: string): Promise<AuthSession> {
  return request<AuthSession>({
    method: "POST",
    url: "/api/auth/switch-organization",
    data: { organizationId },
  });
}

export function createOrganization(name: string): Promise<AuthSession> {
  return request<AuthSession>({
    method: "POST",
    url: "/api/organizations",
    data: { name },
  });
}
