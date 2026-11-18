import type { OrganizationRole } from "../modules/auth/types/auth";
import { request } from "./client";

export interface Membership {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: OrganizationRole;
  createdAt: string;
}

export interface CreateMembershipInput {
  name: string;
  email: string;
  temporaryPassword?: string;
  role: OrganizationRole;
}

export function getMemberships(): Promise<Membership[]> {
  return request<Membership[]>({ method: "GET", url: "/api/memberships" });
}

export function createMembership(input: CreateMembershipInput): Promise<Membership> {
  return request<Membership>({ method: "POST", url: "/api/memberships", data: input });
}

export function updateMembershipRole(
  membershipId: string,
  role: OrganizationRole,
): Promise<Membership> {
  return request<Membership>({
    method: "PATCH",
    url: `/api/memberships/${membershipId}/role`,
    data: { role },
  });
}

export function deleteMembership(membershipId: string): Promise<void> {
  return request<void>({ method: "DELETE", url: `/api/memberships/${membershipId}` });
}
