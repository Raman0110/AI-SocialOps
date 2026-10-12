import type { SocialPlatform } from "../../inbox/types/conversations";

export type SocialAccountStatus = "Connected" | "Needs reauth" | "Disabled";
export type WebhookHealth = "Healthy" | "Failing" | "Not configured";

export interface WebhookEndpoint {
  id: string;
  url: string;
  health: WebhookHealth;
  lastReceivedAt: string | null;
  failureCount: number;
  subscribedEvents: string[];
}

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  displayName: string;
  handle: string;
  externalAccountId: string;
  organizationName: string;
  status: SocialAccountStatus;
  webhook: WebhookEndpoint;
  connectedAt: string;
  lastSyncedAt: string;
  connectedBy: string;
  conversationsToday: number;
  openConversations: number;
}
