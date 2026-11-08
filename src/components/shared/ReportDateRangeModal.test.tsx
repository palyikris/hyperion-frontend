import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ReportDateRangeModal from "./ReportDateRangeModal";
import { selectDate } from "../../testUtils/selectDate";

function renderModal() {
  const onClose = vi.fn();
  const onConfirm = vi.fn();
  render(<ReportDateRangeModal format="pdf" isPending={false} onClose={onClose} onConfirm={onConfirm} />);
  return { onClose, onConfirm };
}

describe("custom report calendars", () => {
  it("closes the calendar before the modal on Escape and restores focus", async () => {
    const { onClose } = renderModal();
    const trigger = screen.getByRole("button", { name: "Start date" });
    expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const calendar = screen.getByRole("dialog", { name: "Calendar for Start date" });
    expect(calendar).toContainElement(document.activeElement as HTMLElement);
    await userEvent.keyboard("{Escape}");
    expect(calendar).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("supports leap days, keyboard month changes, and exports calendar dates unchanged", async () => {
    const { onConfirm } = renderModal();
    await selectDate("Start date", "2024-01-31");
    await userEvent.click(screen.getByRole("button", { name: "Start date" }));
    await userEvent.keyboard("{PageDown}");
    expect(screen.getByRole("button", { name: "Thursday, 29 February 2024" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByLabelText("Start date")).toHaveTextContent("29 Feb 2024");
    await userEvent.click(screen.getByRole("button", { name: "End date" }));
    // An empty end date opens in the selected start month without preselecting it.
    expect(screen.getByRole("button", { name: "Thursday, 1 February 2024" })).not.toHaveFocus();
    expect(screen.getByRole("button", { name: "Thursday, 29 February 2024" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    expect(screen.getByLabelText("End date")).toHaveTextContent("1 Mar 2024");
    await userEvent.click(screen.getByRole("button", { name: "Export PDF" }));
    expect(onConfirm).toHaveBeenCalledWith({ startDate: "2024-02-29", endDate: "2024-03-01" });
  });

  it("shows one calendar at a time, closes on outside clicks, and allows clearing", async () => {
    renderModal();
    await selectDate("Start date", "2026-06-01");
    await userEvent.click(screen.getByRole("button", { name: "Start date" }));
    await userEvent.click(screen.getByRole("button", { name: "End date" }));
    expect(screen.queryByRole("dialog", { name: "Calendar for Start date" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Calendar for End date" })).toBeVisible();
    await userEvent.click(screen.getByRole("heading", { name: "Choose report dates" }));
    expect(screen.queryByRole("dialog", { name: "Calendar for End date" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "End date" })).toHaveFocus();
    await userEvent.click(screen.getByRole("button", { name: "Start date" }));
    await userEvent.click(screen.getByRole("button", { name: "Clear date" }));
    expect(screen.getByLabelText("Start date")).toHaveTextContent("Select a date");
    expect(screen.getByRole("button", { name: "Export PDF" })).toBeDisabled();
  });

  it("keeps Tab navigation inside the modal when the calendar is open", async () => {
    renderModal();
    await userEvent.click(screen.getByRole("button", { name: "Start date" }));
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Today" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "End date" })).toHaveFocus();
    expect(screen.queryByRole("dialog", { name: "Calendar for Start date" })).not.toBeInTheDocument();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Close modal" })).toHaveFocus();
    expect(within(screen.getByRole("dialog")).getByRole("button", { name: "Start date" })).toBeEnabled();
  });

  it("selects adjacent-month dates directly with a pointer", async () => {
    renderModal();
    await selectDate("Start date", "2026-01-31");
    await userEvent.click(screen.getByRole("button", { name: "Start date" }));
    await userEvent.click(screen.getByRole("button", { name: "Sunday, 1 February 2026" }));
    expect(screen.getByLabelText("Start date")).toHaveTextContent("1 Feb 2026");
  });
});
