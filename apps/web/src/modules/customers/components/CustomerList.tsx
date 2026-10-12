import { Avatar, Empty, Tag, Typography } from "antd";
import type { Customer } from "../types/customers";

const { Text } = Typography;

interface CustomerListProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelect: (customerId: string) => void;
}

export function CustomerList({ customers, selectedCustomerId, onSelect }: CustomerListProps) {
  if (customers.length === 0) {
    return (
      <div className="px-4 py-10">
        <Empty description="No customers match your filters." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {customers.map((customer) => {
        const isSelected = customer.id === selectedCustomerId;

        return (
          <button
            key={customer.id}
            type="button"
            onClick={() => onSelect(customer.id)}
            className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${
              isSelected ? "bg-blue-50" : "bg-white hover:bg-slate-50"
            }`}
          >
            <Avatar className={isSelected ? "bg-blue-600" : "bg-slate-700"}>
              {customer.name.slice(0, 1)}
            </Avatar>

            <div className="min-w-0">
              <Text strong className="block truncate text-slate-900">
                {customer.name}
              </Text>
              <Text type="secondary" className="block truncate text-xs">
                {customer.email}
              </Text>
              <div className="mt-1 flex flex-wrap gap-1">
                {customer.tags.slice(0, 2).map((tag) => (
                  <Tag key={tag} className="m-0 text-[11px]">
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <Tag color={statusColors[customer.status]} className="m-0 text-xs">
                {customer.status}
              </Tag>
              <Text type="secondary" className="whitespace-nowrap text-xs">
                {customer.totalConversations} conv.
              </Text>
            </div>
          </button>
        );
      })}
    </div>
  );
}

const statusColors: Record<Customer["status"], string> = {
  Active: "processing",
  "Needs attention": "error",
  Resolved: "success",
};
