import { getCustomers } from "../../../api/customers";
import { runtimeConfig } from "../../../shared/config/runtime";
import { getMockCustomers } from "../mocks/customersMock";
import type { Customer } from "../types/customers";

export interface CustomerDataSource {
  mode: "api" | "mock";
  getCustomers: () => Promise<Customer[]>;
}

export const apiCustomerDataSource: CustomerDataSource = {
  mode: "api",
  getCustomers,
};

export const mockCustomerDataSource: CustomerDataSource = {
  mode: "mock",
  getCustomers: getMockCustomers,
};

export const defaultCustomerDataSource = runtimeConfig.useMocks
  ? mockCustomerDataSource
  : apiCustomerDataSource;
