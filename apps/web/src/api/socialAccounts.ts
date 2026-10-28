import type { SocialAccount } from "../modules/social-accounts/types/socialAccounts";
import type { SocialPlatform } from "../modules/inbox/types/conversations";
import { request } from "./client";

interface SocialAccountResponse {
  id: string;
  organizationId: string;
  platform: SocialPlatform;
  externalAccountId: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
}

export async function getSocialAccounts(): Promise<SocialAccount[]> {
  const accounts = await request<SocialAccountResponse[]>({
    method: "GET",
    url: "/api/social-accounts",
  });

  return accounts.map(mapSocialAccount);
}

function mapSocialAccount(account: SocialAccountResponse): SocialAccount {
  return {
    id: account.id,
    platform: account.platform,
    displayName: account.displayName,
    handle: account.externalAccountId,
    externalAccountId: account.externalAccountId,
    organizationName: "Current organization",
    status: account.isActive ? "Connected" : "Disabled",
    webhook: {
      id: "Not configured",
      url: "Not configured",
      health: "Not configured",
      lastReceivedAt: null,
      failureCount: 0,
      subscribedEvents: [],
    },
    connectedAt: account.createdAt,
    lastSyncedAt: account.createdAt,
    connectedBy: "Not available",
    conversationsToday: 0,
    openConversations: 0,
  };
}
