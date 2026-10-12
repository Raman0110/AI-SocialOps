import type { Customer } from "../types/customers";

const delay = (duration = 180) =>
  import.meta.env.MODE === "test"
    ? Promise.resolve()
    : new Promise((resolve) => window.setTimeout(resolve, duration));

const customers: Customer[] = [
  {
    id: "cust-maya",
    name: "Maya Sharma",
    email: "maya.sharma@example.com",
    phone: "+977-9801000001",
    location: "Kathmandu, Nepal",
    segment: "VIP",
    status: "Active",
    lifetimeValue: 1840,
    totalConversations: 12,
    lastSeenAt: "2026-10-08T09:25:00Z",
    tags: ["Express delivery", "High intent", "Instagram"],
    notes: "Prefers quick delivery updates and usually responds on Instagram.",
    socialIdentities: [
      {
        id: "identity-maya-instagram",
        platform: "Instagram",
        username: "maya.designs",
        externalAccountId: "ig_178414000000001",
        socialAccountName: "UrbanThreads Instagram",
        isPrimary: true,
      },
    ],
    conversations: [
      {
        id: "conv-maya",
        platform: "Instagram",
        topic: "Express delivery before Friday",
        status: "Open",
        lastMessageAt: "2026-10-08T09:25:00Z",
      },
      {
        id: "conv-maya-fit",
        platform: "Instagram",
        topic: "Sizing advice for linen jacket",
        status: "Resolved",
        lastMessageAt: "2026-09-30T14:10:00Z",
      },
    ],
    activity: [
      {
        id: "activity-maya-1",
        title: "Asked about express delivery",
        description: "Customer needs order delivered before Friday.",
        createdAt: "2026-10-08T09:25:00Z",
      },
      {
        id: "activity-maya-2",
        title: "AI classified intent",
        description: "Intent: delivery_question, priority: medium, risk: low.",
        createdAt: "2026-10-08T09:26:00Z",
      },
    ],
  },
  {
    id: "cust-ravi",
    name: "Ravi Thapa",
    email: "ravi.thapa@example.com",
    phone: "+977-9800000000",
    location: "Lalitpur, Nepal",
    segment: "Repeat buyer",
    status: "Needs attention",
    lifetimeValue: 620,
    totalConversations: 6,
    lastSeenAt: "2026-10-08T08:40:00Z",
    tags: ["Exchange", "WhatsApp", "Priority"],
    notes: "Has an active exchange request. Keep communication clear and fast.",
    socialIdentities: [
      {
        id: "identity-ravi-whatsapp",
        platform: "WhatsApp",
        username: "+977-9800000000",
        externalAccountId: "wa_9779800000000",
        socialAccountName: "UrbanThreads WhatsApp",
        isPrimary: true,
      },
    ],
    conversations: [
      {
        id: "conv-ravi",
        platform: "WhatsApp",
        topic: "Wrong jacket size exchange",
        status: "Pending",
        lastMessageAt: "2026-10-08T08:40:00Z",
      },
    ],
    activity: [
      {
        id: "activity-ravi-1",
        title: "Exchange request received",
        description: "Customer says the jacket size was wrong.",
        createdAt: "2026-10-08T08:40:00Z",
      },
      {
        id: "activity-ravi-2",
        title: "Support ticket suggested",
        description: "AI generated a pending CreateSupportTicket action.",
        createdAt: "2026-10-08T08:43:00Z",
      },
    ],
  },
  {
    id: "cust-sophia",
    name: "Sophia Lee",
    email: "sophia.lee@example.com",
    location: "Singapore",
    segment: "At risk",
    status: "Needs attention",
    lifetimeValue: 320,
    totalConversations: 4,
    lastSeenAt: "2026-10-07T16:10:00Z",
    tags: ["Complaint", "Escalated", "Facebook"],
    notes: "Customer is frustrated about delayed responses. Needs human follow-up.",
    socialIdentities: [
      {
        id: "identity-sophia-facebook",
        platform: "Facebook",
        username: "sophia.lee",
        externalAccountId: "fb_102030405060",
        socialAccountName: "UrbanThreads Facebook",
        isPrimary: true,
      },
    ],
    conversations: [
      {
        id: "conv-sophia",
        platform: "Facebook",
        topic: "Delayed response complaint",
        status: "Escalated",
        lastMessageAt: "2026-10-07T16:10:00Z",
      },
    ],
    activity: [
      {
        id: "activity-sophia-1",
        title: "Escalated complaint",
        description: "Customer reported messaging multiple times without response.",
        createdAt: "2026-10-07T16:10:00Z",
      },
      {
        id: "activity-sophia-2",
        title: "Risk detected",
        description: "AI marked the conversation as high-risk.",
        createdAt: "2026-10-07T16:12:00Z",
      },
    ],
  },
  {
    id: "cust-nima",
    name: "Nima Gurung",
    email: "nima.gurung@example.com",
    location: "Pokhara, Nepal",
    segment: "New lead",
    status: "Resolved",
    lifetimeValue: 140,
    totalConversations: 2,
    lastSeenAt: "2026-10-07T11:15:00Z",
    tags: ["TikTok", "Resolved"],
    notes: "Came through TikTok campaign and had a positive first interaction.",
    socialIdentities: [
      {
        id: "identity-nima-tiktok",
        platform: "TikTok",
        username: "@nima.moves",
        externalAccountId: "tt_704500000001",
        socialAccountName: "UrbanThreads TikTok",
        isPrimary: true,
      },
    ],
    conversations: [
      {
        id: "conv-nima",
        platform: "TikTok",
        topic: "Product availability",
        status: "Resolved",
        lastMessageAt: "2026-10-07T11:15:00Z",
      },
    ],
    activity: [
      {
        id: "activity-nima-1",
        title: "Conversation resolved",
        description: "Customer confirmed the answer was helpful.",
        createdAt: "2026-10-07T11:15:00Z",
      },
    ],
  },
];

export async function getMockCustomers(): Promise<Customer[]> {
  await delay();
  return customers.map(cloneCustomer);
}

export async function getMockCustomer(customerId: string): Promise<Customer> {
  await delay();
  const customer = customers.find((item) => item.id === customerId);

  if (!customer) {
    throw new Error("Customer not found.");
  }

  return cloneCustomer(customer);
}

function cloneCustomer(customer: Customer): Customer {
  return {
    ...customer,
    tags: [...customer.tags],
    socialIdentities: customer.socialIdentities.map((identity) => ({ ...identity })),
    conversations: customer.conversations.map((conversation) => ({ ...conversation })),
    activity: customer.activity.map((activity) => ({ ...activity })),
  };
}
