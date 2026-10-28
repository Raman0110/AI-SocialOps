import type { Customer } from "../modules/customers/types/customers";
import { request } from "./client";

interface CustomerResponse {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  createdAt: string;
}

export async function getCustomers(): Promise<Customer[]> {
  const customers = await request<CustomerResponse[]>({
    method: "GET",
    url: "/api/customers",
  });

  return customers.map(mapCustomer);
}

function mapCustomer(customer: CustomerResponse): Customer {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email ?? "No email address",
    phone: customer.phoneNumber ?? undefined,
    location: "Not available",
    segment: "New lead",
    status: "Active",
    lifetimeValue: 0,
    totalConversations: 0,
    lastSeenAt: customer.createdAt,
    tags: [],
    notes: "Additional customer context is not available from the API yet.",
    socialIdentities: [],
    conversations: [],
    activity: [],
  };
}
