import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CustomersPage } from "./CustomersPage";
import { mockCustomerDataSource } from "../services/customerDataSource";

describe("CustomersPage", () => {
  it("loads customers and shows the selected customer profile", async () => {
    render(<CustomersPage onOpenInbox={vi.fn()} dataSource={mockCustomerDataSource} />);

    expect(await screen.findAllByText("Maya Sharma")).toHaveLength(2);
    expect(screen.getByText("Social identities")).toBeInTheDocument();
    expect(screen.getByText("Recent conversations")).toBeInTheDocument();
    expect(screen.getByText("Customer context")).toBeInTheDocument();
  });

  it("filters customers by search term", async () => {
    const user = userEvent.setup();

    render(<CustomersPage onOpenInbox={vi.fn()} dataSource={mockCustomerDataSource} />);

    await screen.findAllByText("Maya Sharma");

    await user.type(screen.getByPlaceholderText(/search by name/i), "Sophia");

    await waitFor(() => {
      expect(screen.getAllByText("Sophia Lee")).toHaveLength(2);
      expect(screen.queryByText("Ravi Thapa")).not.toBeInTheDocument();
    });
  });

  it("opens the inbox from a customer profile", async () => {
    const user = userEvent.setup();
    const onOpenInbox = vi.fn();

    render(<CustomersPage onOpenInbox={onOpenInbox} dataSource={mockCustomerDataSource} />);

    await screen.findAllByText("Maya Sharma");
    await user.click(screen.getByRole("button", { name: /open conversations/i }));

    expect(onOpenInbox).toHaveBeenCalledOnce();
  });
});
