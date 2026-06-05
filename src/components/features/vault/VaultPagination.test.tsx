import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import VaultPagination from "./VaultPagination";

describe("VaultPagination", () => {
  it("renders nothing when there is only one page", () => {
    const { container } = render(
      <VaultPagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows page navigation and calls back with the selected page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <VaultPagination
        currentPage={4}
        totalPages={7}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getAllByText("...")).toHaveLength(2);
    expect(screen.getByText("Page 4 of 7")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole("button", { name: "5" }));
    expect(onPageChange).toHaveBeenCalledWith(5);

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(5);
  });
});