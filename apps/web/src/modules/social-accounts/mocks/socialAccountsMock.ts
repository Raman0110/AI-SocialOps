import type { SocialAccount } from "../types/socialAccounts";

const delay = (duration = 180) =>
  import.meta.env.MODE === "test"
    ? Promise.resolve()
    : new Promise((resolve) => window.setTimeout(resolve, duration));

const socialAccounts: SocialAccount[] = [
  {
    id: "acct-instagram-urbanthreads",
    platform: "Instagram",
    displayName: "UrbanThreads Instagram",
    handle: "@urbanthreads",
    externalAccountId: "ig_17841400000000991",
    organizationName: "UrbanThreads",
    status: "Connected",
    webhook: {
      id: "webhook-instagram-main",
      url: "https://api.socialops.local/webhooks/instagram",
      health: "Healthy",
      lastReceivedAt: "2026-10-08T09:25:00Z",
      failureCount: 0,
      subscribedEvents: ["messages", "comments", "mentions"],
    },
    connectedAt: "2026-09-14T10:30:00Z",
    lastSyncedAt: "2026-10-08T09:27:00Z",
    connectedBy: "Development Owner",
    conversationsToday: 42,
    openConversations: 11,
  },
  {
    id: "acct-whatsapp-urbanthreads",
    platform: "WhatsApp",
    displayName: "UrbanThreads WhatsApp",
    handle: "+977-9800000000",
    externalAccountId: "wa_9779800000000",
    organizationName: "UrbanThreads",
    status: "Connected",
    webhook: {
      id: "webhook-whatsapp-main",
      url: "https://api.socialops.local/webhooks/whatsapp",
      health: "Healthy",
      lastReceivedAt: "2026-10-08T08:40:00Z",
      failureCount: 0,
      subscribedEvents: ["messages", "message_status"],
    },
    connectedAt: "2026-09-18T08:00:00Z",
    lastSyncedAt: "2026-10-08T08:41:00Z",
    connectedBy: "Development Owner",
    conversationsToday: 28,
    openConversations: 7,
  },
  {
    id: "acct-facebook-urbanthreads",
    platform: "Facebook",
    displayName: "UrbanThreads Facebook",
    handle: "UrbanThreads",
    externalAccountId: "fb_102030405060",
    organizationName: "UrbanThreads",
    status: "Needs reauth",
    webhook: {
      id: "webhook-facebook-main",
      url: "https://api.socialops.local/webhooks/facebook",
      health: "Failing",
      lastReceivedAt: "2026-10-07T16:10:00Z",
      failureCount: 5,
      subscribedEvents: ["messages", "comments"],
    },
    connectedAt: "2026-08-29T12:45:00Z",
    lastSyncedAt: "2026-10-07T16:12:00Z",
    connectedBy: "Development Owner",
    conversationsToday: 9,
    openConversations: 3,
  },
  {
    id: "acct-tiktok-urbanthreads",
    platform: "TikTok",
    displayName: "UrbanThreads TikTok",
    handle: "@urbanthreads.shop",
    externalAccountId: "tt_704500000099",
    organizationName: "UrbanThreads",
    status: "Connected",
    webhook: {
      id: "webhook-tiktok-main",
      url: "https://api.socialops.local/webhooks/tiktok",
      health: "Not configured",
      lastReceivedAt: null,
      failureCount: 0,
      subscribedEvents: ["comments"],
    },
    connectedAt: "2026-09-24T15:20:00Z",
    lastSyncedAt: "2026-10-07T11:15:00Z",
    connectedBy: "Development Owner",
    conversationsToday: 6,
    openConversations: 1,
  },
  {
    id: "acct-x-urbanthreads",
    platform: "X",
    displayName: "UrbanThreads X",
    handle: "@urbanthreads",
    externalAccountId: "x_8800004401",
    organizationName: "UrbanThreads",
    status: "Disabled",
    webhook: {
      id: "webhook-x-main",
      url: "https://api.socialops.local/webhooks/x",
      health: "Not configured",
      lastReceivedAt: null,
      failureCount: 0,
      subscribedEvents: [],
    },
    connectedAt: "2026-09-02T10:00:00Z",
    lastSyncedAt: "2026-09-25T13:25:00Z",
    connectedBy: "Development Owner",
    conversationsToday: 0,
    openConversations: 0,
  },
];

export async function getMockSocialAccounts(): Promise<SocialAccount[]> {
  await delay();
  return socialAccounts.map(cloneSocialAccount);
}

function cloneSocialAccount(account: SocialAccount): SocialAccount {
  return {
    ...account,
    webhook: {
      ...account.webhook,
      subscribedEvents: [...account.webhook.subscribedEvents],
    },
  };
}
