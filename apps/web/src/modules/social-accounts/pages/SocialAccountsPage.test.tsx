import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SocialAccountsPage } from "./SocialAccountsPage";

describe("SocialAccountsPage", () => {
  it("loads social accounts and shows webhook details", async () => {
    render(<SocialAccountsPage />);

    expect(await screen.findAllByText("UrbanThreads Instagram")).toHaveLength(2);
    expect(screen.getByText("Webhook health")).toBeInTheDocument();
    expect(screen.getAllByText("External account id")).toHaveLength(2);
  });

  it("filters accounts by search term", async () => {
    const user = userEvent.setup();

    render(<SocialAccountsPage />);

    await screen.findAllByText("UrbanThreads Instagram");
    await user.type(screen.getByPlaceholderText(/search account/i), "facebook");

    await waitFor(() => {
      expect(screen.getAllByText("UrbanThreads Facebook")).toHaveLength(2);
      expect(screen.queryByText("UrbanThreads WhatsApp")).not.toBeInTheDocument();
    });
  });

  it("selects an account from the table", async () => {
    const user = userEvent.setup();

    render(<SocialAccountsPage />);

    await screen.findAllByText("UrbanThreads Instagram");
    await user.click(screen.getByText("UrbanThreads WhatsApp"));

    expect(screen.getAllByText("UrbanThreads WhatsApp")).toHaveLength(2);
    expect(screen.getAllByText("wa_9779800000000")).toHaveLength(2);
  });
});
