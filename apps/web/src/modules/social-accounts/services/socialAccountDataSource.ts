import { getSocialAccounts } from "../../../api/socialAccounts";
import { runtimeConfig } from "../../../shared/config/runtime";
import { getMockSocialAccounts } from "../mocks/socialAccountsMock";
import type { SocialAccount } from "../types/socialAccounts";

export interface SocialAccountDataSource {
  mode: "api" | "mock";
  getSocialAccounts: () => Promise<SocialAccount[]>;
}

export const apiSocialAccountDataSource: SocialAccountDataSource = {
  mode: "api",
  getSocialAccounts,
};

export const mockSocialAccountDataSource: SocialAccountDataSource = {
  mode: "mock",
  getSocialAccounts: getMockSocialAccounts,
};

export const defaultSocialAccountDataSource = runtimeConfig.useMocks
  ? mockSocialAccountDataSource
  : apiSocialAccountDataSource;
