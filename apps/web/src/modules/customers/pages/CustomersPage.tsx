import { useEffect, useMemo, useState } from "react";
import { Alert, Input, Select, Spin, Typography } from "antd";
import { CustomerList } from "../components/CustomerList";
import { CustomerProfile } from "../components/CustomerProfile";
import {
  defaultCustomerDataSource,
  type CustomerDataSource,
} from "../services/customerDataSource";
import type { Customer, CustomerSegment } from "../types/customers";

const { Text, Title } = Typography;

interface CustomersPageProps {
  onOpenInbox: () => void;
  dataSource?: CustomerDataSource;
}

export function CustomersPage({
  onOpenInbox,
  dataSource = defaultCustomerDataSource,
}: CustomersPageProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegment | "All">("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !normalizedSearchTerm ||
        customer.name.toLowerCase().includes(normalizedSearchTerm) ||
        customer.email.toLowerCase().includes(normalizedSearchTerm) ||
        customer.tags.some((tag) => tag.toLowerCase().includes(normalizedSearchTerm));
      const matchesSegment =
        segmentFilter === "All" || customer.segment === segmentFilter;

      return matchesSearch && matchesSegment;
    });
  }, [customers, searchTerm, segmentFilter]);

  const visibleSelectedCustomerId = useMemo(() => {
    if (
      selectedCustomerId &&
      filteredCustomers.some((customer) => customer.id === selectedCustomerId)
    ) {
      return selectedCustomerId;
    }

    return filteredCustomers[0]?.id ?? null;
  }, [filteredCustomers, selectedCustomerId]);

  const selectedCustomer = useMemo(
    () =>
      customers.find((customer) => customer.id === visibleSelectedCustomerId) ?? null,
    [customers, visibleSelectedCustomerId],
  );

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const result = await dataSource.getCustomers();
        setCustomers(result);

        if (result.length > 0) {
          setSelectedCustomerId(result[0].id);
        }
      } catch {
        setError("Unable to load customers.");
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, [dataSource]);

  function handleSelectCustomer(customerId: string) {
    setSelectedCustomerId(customerId);
  }

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spin description="Loading customers..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Alert showIcon type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] gap-4 bg-slate-100 p-4">
      <aside className="w-[380px] shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50/80 p-4">
          <Title level={5} className="mb-1">
            Customers
          </Title>
          <Text type="secondary">
            {filteredCustomers.length} of {customers.length} customer profiles
          </Text>

          <Input.Search
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, email, or tag"
            className="mt-4"
            allowClear
          />

          <Select
            value={segmentFilter}
            onChange={(value) => setSegmentFilter(value)}
            className="mt-3 w-full"
            options={[
              { value: "All", label: "All segments" },
              { value: "VIP", label: "VIP" },
              { value: "Repeat buyer", label: "Repeat buyer" },
              { value: "New lead", label: "New lead" },
              { value: "At risk", label: "At risk" },
            ]}
          />
        </div>

        <CustomerList
          customers={filteredCustomers}
          selectedCustomerId={visibleSelectedCustomerId}
          onSelect={handleSelectCustomer}
        />
      </aside>

      <main className="min-w-0 flex-1 overflow-hidden rounded-md border border-slate-200 bg-white">
        <CustomerProfile customer={selectedCustomer} onOpenInbox={onOpenInbox} />
      </main>
    </div>
  );
}
