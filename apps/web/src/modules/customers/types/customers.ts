import type { ConversationStatus, SocialPlatform } from "../../inbox/types/conversations";

export type CustomerSegment = "VIP" | "Repeat buyer" | "New lead" | "At risk";

export interface CustomerSocialIdentity {
  id: string;
  platform: SocialPlatform;
  username: string;
  externalAccountId: string;
  socialAccountName: string;
  isPrimary: boolean;
}

export interface CustomerConversationSummary {
  id: string;
  platform: SocialPlatform;
  topic: string;
  status: ConversationStatus;
  lastMessageAt: string;
}

export interface CustomerActivity {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  segment: CustomerSegment;
  status: "Active" | "Needs attention" | "Resolved";
  lifetimeValue: number;
  totalConversations: number;
  lastSeenAt: string;
  tags: string[];
  notes: string;
  socialIdentities: CustomerSocialIdentity[];
  conversations: CustomerConversationSummary[];
  activity: CustomerActivity[];
}
