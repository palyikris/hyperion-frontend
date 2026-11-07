import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StatsPage from "./stats";
import type { PropsWithChildren } from "react";

const { service } = vi.hoisted(() => ({ service: {
  exportCleanupManifest: vi.fn(), exportCleanupManifestPdf: vi.fn(),
} }));
vi.mock("../services/statsService", () => ({ statsService: service }));
vi.mock("../services/toastService", () => ({ toastService: { success: vi.fn(), error: vi.fn() } }));
vi.mock("../hooks/stats/useStatsSummary", () => ({ useStatsSummary: () => ({ data: {}, isLoading: false }) }));
vi.mock("../hooks/stats/useEnvironmentalFootprint", () => ({ useEnvironmentalFootprint: () => ({ data: {}, isLoading: false }) }));
vi.mock("../hooks/stats/useFunFacts", () => ({ useFunFacts: () => ({ isLoading: false }) }));
vi.mock("../components/features/stats/EnvironmentalFootprintChart", () => ({ default: () => null }));
vi.mock("../components/features/stats/TemporalTrendsChart", () => ({ default: () => null }));
vi.mock("../components/features/stats/AIFleetEfficiencyChart", () => ({ default: () => null }));
vi.mock("../components/features/stats/MeanTimeToProcessChart", () => ({ default: () => null }));
vi.mock("../components/features/stats/HotspotDensityChart", () => ({ default: () => null }));
vi.mock("../components/features/stats/TrashCompositionChart", () => ({ default: () => null }));
vi.mock("../components/features/stats/StatsBentoCard", () => ({ default: ({ children }: PropsWithChildren) => <section>{children}</section> }));
vi.mock("../components/shared/Title", () => ({ Title: ({ text }: { text: string }) => <h1>{text}</h1> }));

let client: QueryClient;
beforeEach(() => {
  vi.clearAllMocks();
  for (const request of Object.values(service)) {
    request.mockResolvedValue({ blob: new Blob(["report"]), filename: "report.xlsx" });
  }
  vi.stubGlobal("URL", class extends URL {
    static createObjectURL = vi.fn(() => "blob:report");
    static revokeObjectURL = vi.fn();
  });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  client = new QueryClient();
  render(<QueryClientProvider client={client}><StatsPage /></QueryClientProvider>);
});
afterEach(() => {
  client.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function setDates(start: string, end: string) {
  fireEvent.change(screen.getByLabelText("Start date"), { target: { value: start } });
  fireEvent.change(screen.getByLabelText("End date"), { target: { value: end } });
}

describe.each([
  { label: "Export Manifest", method: service.exportCleanupManifest },
  { label: "Export PDF", method: service.exportCleanupManifestPdf },
])("$label date selection", ({ label, method }) => {
  it("requires both dates and exports the selected range, including a single day", async () => {
    await userEvent.click(screen.getByRole("button", { name: label }));
    const dialog = screen.getByRole("dialog", { name: "Choose report dates" });
    const confirm = within(dialog).getByRole("button", { name: label });
    expect(screen.getByLabelText("Start date")).toHaveFocus();
    expect(confirm).toBeDisabled();
    expect(method).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2026-06-01" } });
    expect(confirm).toBeDisabled();
    setDates("2026-06-02", "2026-06-01");
    expect(confirm).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("End date must be on or after start date.");
    setDates("2026-06-01", "2026-06-01");
    expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    await waitFor(() => expect(method).toHaveBeenCalledExactlyOnceWith(
      { startDate: "2026-06-01", endDate: "2026-06-01" }, "en",
    ));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce();
  });

  it("cancels without exporting and asks for dates again on the next click", async () => {
    const trigger = screen.getByRole("button", { name: label });
    await userEvent.click(trigger);
    setDates("2026-01-01", "2026-12-31");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(method).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    expect(screen.getByLabelText("Start date")).toHaveValue("");
    expect(screen.getByLabelText("End date")).toHaveValue("");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("prevents duplicate exports while the request is pending", async () => {
    let finish!: (value: { blob: Blob; filename: string }) => void;
    method.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    await userEvent.click(screen.getByRole("button", { name: label }));
    setDates("2026-01-01", "2026-12-31");
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: label }));
    await waitFor(() => expect(screen.getByLabelText("Start date")).toBeDisabled());
    const pending = within(screen.getByRole("dialog")).getByRole("button", { name: `${label}...` });
    expect(pending).toBeDisabled();
    await userEvent.click(pending);
    expect(method).toHaveBeenCalledOnce();
    finish({ blob: new Blob(["report"]), filename: "report.xlsx" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("keeps the chosen dates available after a failed export for retry", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    method.mockRejectedValueOnce(new Error("Report unavailable"));
    await userEvent.click(screen.getByRole("button", { name: label }));
    setDates("2026-01-01", "2026-12-31");
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: label }));
    await waitFor(() => expect(within(screen.getByRole("dialog")).getByRole("button", { name: label })).toBeEnabled());
    expect(screen.getByLabelText("Start date")).toHaveValue("2026-01-01");
    expect(screen.getByLabelText("End date")).toHaveValue("2026-12-31");
  });
});
