import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import VaultFilters from "./VaultFilters";

vi.mock("../../shared/Button", () => ({
  Button: ({ text, onClick, type = "button", disabled = false, icon }: any) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-testid={text === "" ? "vault-filters-direction" : undefined}
    >
      {text}
      {icon}
    </button>
  ),
}));

describe("VaultFilters", () => {
  it("submits normalized filter values", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const onStatusChange = vi.fn();
    const onOrderByChange = vi.fn();
    const onToggleDirection = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <VaultFilters
        search=""
        onSearchChange={onSearchChange}
        statusFilter=""
        onStatusChange={onStatusChange}
        orderBy="created_at"
        onOrderByChange={onOrderByChange}
        direction="desc"
        onToggleDirection={onToggleDirection}
        pageSize={20}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    await user.type(screen.getByLabelText("Search"), "  nebula  ");
    await user.selectOptions(screen.getByLabelText("Status"), "READY");
    await user.selectOptions(screen.getByLabelText("Sort By"), "filename");
    await user.selectOptions(screen.getByLabelText("Items Per Page"), "50");

    await user.click(screen.getByRole("button", { name: "Apply filters" }));

    expect(onSearchChange).toHaveBeenCalledWith("nebula");
    expect(onStatusChange).toHaveBeenCalledWith("READY");
    expect(onOrderByChange).toHaveBeenCalledWith("filename");
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
    expect(onToggleDirection).not.toHaveBeenCalled();
  });

  it("resets back to the default vault filter values", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const onStatusChange = vi.fn();
    const onOrderByChange = vi.fn();
    const onToggleDirection = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <VaultFilters
        search="draft"
        onSearchChange={onSearchChange}
        statusFilter="READY"
        onStatusChange={onStatusChange}
        orderBy="filename"
        onOrderByChange={onOrderByChange}
        direction="asc"
        onToggleDirection={onToggleDirection}
        pageSize={50}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(onSearchChange).toHaveBeenCalledWith("");
    expect(onStatusChange).toHaveBeenCalledWith("");
    expect(onOrderByChange).toHaveBeenCalledWith("created_at");
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });
});