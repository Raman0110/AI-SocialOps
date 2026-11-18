export type OrganizationRole = "Owner" | "Admin" | "Agent" | "Viewer";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthOrganization {
  id: string;
  name: string;
  role: OrganizationRole;
}

export interface AuthSession {
  accessToken: string;
  expiresAtUtc: string;
  user: AuthUser;
  organization: AuthOrganization;
  memberships: AuthOrganization[];
}

export interface LoginInput {
  email: string;
  password: string;
  organizationId?: string;
}
