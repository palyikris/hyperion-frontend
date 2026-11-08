import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAIFleetEfficiency } from "../hooks/stats/useAIFleetEfficiency";
import { useHotspotDensity } from "../hooks/stats/useHotspotDensity";
import { useMeanTimeToProcess } from "../hooks/stats/useMeanTimeToProcess";
import { useTemporalTrends } from "../hooks/stats/useTemporalTrends";
import { useTrashComposition } from "../hooks/stats/useTrashComposition";
import type { FunFact } from "../types/stats";
import StatsPage from "./stats";
import { selectDate } from "../testUtils/selectDate";

const { service } = vi.hoisted(() => ({
  service: {
    getEnvironmentalFootprint: vi.fn(), getStatsSummary: vi.fn(),
    getFunFacts: vi.fn(), getHotspotDensity: vi.fn(),
    getMeanTimeToProcess: vi.fn(), getTemporalTrends: vi.fn(),
    getTrashComposition: vi.fn(), getAIFleetEfficiency: vi.fn(),
    exportCleanupManifest: vi.fn(), exportCleanupManifestPdf: vi.fn(),
  },
}));
vi.mock("../services/statsService", () => ({ statsService: service }));
vi.mock("../services/toastService", () => ({ toastService: { success: vi.fn(), error: vi.fn() } }));
vi.mock("../components/shared/Button", () => ({
  Button: ({ text, onClick, disabled }: {
    text: string; onClick?: () => void; disabled?: boolean;
  }) => <button onClick={onClick} disabled={disabled}>{text}</button>,
}));
vi.mock("../components/shared/Title", () => ({
  Title: ({ text }: { text: string }) => <h1>{text}</h1>,
}));
vi.mock("../components/features/stats/StatsBentoCard", () => ({
  default: ({ children, id, description }: PropsWithChildren<{ id: string; description?: string }>) =>
    <section id={id}>{description && <p>{description}</p>}{children}</section>,
}));
vi.mock("../components/features/stats/FunFactBox", () => ({
  default: ({ funFact }: { funFact: FunFact | undefined }) =>
    <article data-testid="fun-fact">{funFact?.title}: {funFact?.fact}</article>,
}));
// Keep the real query hooks: the charts subscribe to distinct cache keys.
vi.mock("../components/features/stats/HotspotDensityChart", () => ({
  default: function HotspotChart() { useHotspotDensity(); return <div>Hotspot chart</div>; },
}));
vi.mock("../components/features/stats/MeanTimeToProcessChart", () => ({
  default: function MeanTimeChart() { useMeanTimeToProcess(); return null; },
}));
vi.mock("../components/features/stats/TemporalTrendsChart", () => ({
  default: function TemporalChart() { useTemporalTrends(30); return null; },
}));
vi.mock("../components/features/stats/TrashCompositionChart", () => ({
  default: function TrashChart() { useTrashComposition(); return null; },
}));
vi.mock("../components/features/stats/AIFleetEfficiencyChart", () => ({
  default: function FleetChart() { useAIFleetEfficiency(); return null; },
}));

const queries = [
  { key: ["stats", "fun-facts", "en", 4], fetch: service.getFunFacts },
  { key: ["stats", "hotspot-density"], fetch: service.getHotspotDensity },
  { key: ["stats", "mean-time-to-process"], fetch: service.getMeanTimeToProcess },
  { key: ["stats", "temporal-trends", 30], fetch: service.getTemporalTrends },
  { key: ["stats", "trash-composition"], fetch: service.getTrashComposition },
  { key: ["stats", "ai-fleet-efficiency"], fetch: service.getAIFleetEfficiency },
];
const clients: QueryClient[] = [];
const firstData = { version: 1, facts: [], totalAreaSqm: 12.5, totalDetections: 3 };
const secondData = { ...firstData, version: 2 };

function renderPage(cached = true) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clients.push(client);
  if (cached) for (const { key } of queries) client.setQueryData(key, firstData);
  client.setQueryData(["stats", "temporal-trends", 90], { version: 1 });
  client.setQueryData(["vault"], { version: 1 });
  render(<QueryClientProvider client={client}><StatsPage /></QueryClientProvider>);
  return client;
}

beforeEach(() => {
  vi.resetAllMocks();
  for (const { fetch } of queries) fetch.mockResolvedValue(secondData);
  service.exportCleanupManifest.mockResolvedValue({ blob: new Blob(["xlsx"]), filename: "manifest.xlsx" });
  service.exportCleanupManifestPdf.mockResolvedValue({ blob: new Blob(["pdf"]), filename: "report.pdf" });
  vi.stubGlobal("URL", class extends URL {
    static createObjectURL = vi.fn(() => "blob:test-download");
    static revokeObjectURL = vi.fn();
  });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});
afterEach(() => {
  for (const client of clients.splice(0)) client.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("statistics page refresh", () => {
  it("refetches every active statistic and invalidates inactive time windows", async () => {
    const client = renderPage();
    for (const { fetch } of queries) expect(fetch).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Refresh Data" }));
    await waitFor(() => {
      for (const { key, fetch } of queries) {
        expect(fetch, JSON.stringify(key)).toHaveBeenCalledOnce();
        expect(client.getQueryData(key)).toEqual(secondData);
      }
    });
    expect(client.getQueryState(["stats", "temporal-trends", 90])?.isInvalidated).toBe(true);
    expect(client.getQueryState(["vault"])?.isInvalidated).toBe(false);
    expect(service.getStatsSummary).not.toHaveBeenCalled();
  });

  it("keeps refresh disabled until the last chart finishes", async () => {
    let resolve!: (value: unknown) => void;
    service.getTrashComposition.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const client = renderPage();
    await userEvent.click(screen.getByRole("button", { name: "Refresh Data" }));
    await waitFor(() => {
      expect(service.getTrashComposition).toHaveBeenCalledOnce();
      expect(client.getQueryState(["stats", "hotspot-density"])?.fetchStatus).toBe("idle");
    });
    const button = screen.getByRole("button", { name: "Refresh Data..." });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(service.getTrashComposition).toHaveBeenCalledOnce();
    await act(async () => { resolve(secondData); });
    await waitFor(() => expect(screen.getByRole("button", { name: "Refresh Data" })).toBeEnabled());
  });

  it("finishes refreshing even when one chart request fails", async () => {
    service.getTrashComposition.mockRejectedValueOnce(new Error("Network unavailable"));
    const client = renderPage();
    await userEvent.click(screen.getByRole("button", { name: "Refresh Data" }));
    await waitFor(() => {
      expect(client.getQueryState(["stats", "trash-composition"])?.status).toBe("error");
    });
    expect(screen.getByRole("button", { name: "Refresh Data" })).toBeEnabled();
    expect(client.getQueryData(["stats", "hotspot-density"])).toEqual(secondData);
  });
});

describe("statistics partial loading and failure", () => {
  it("keeps other charts and exports available during initial requests", () => {
    service.getFunFacts.mockReturnValue(new Promise(() => {}));
    renderPage(false);

    expect(document.getElementById("chart-environmental")).not.toBeInTheDocument();
    expect(service.getEnvironmentalFootprint).not.toHaveBeenCalled();
    expect(screen.getByText("Hotspot chart")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export Manifest" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Export PDF" })).toBeEnabled();
    expect(service.getStatsSummary).not.toHaveBeenCalled();
  });
});

describe("personalized fact cards", () => {
  it.each([0, 1, 2, 3, 4])("renders exactly %i returned facts without empty cards", async (count) => {
    const client = renderPage();
    const facts = Array.from({ length: count }, (_, index) => ({
      title: `Fact ${index}`, fact: `Insight ${index}`, icon: "award",
    }));
    act(() => { client.setQueryData(["stats", "fun-facts", "en", 4], { facts }); });

    await waitFor(() => expect(screen.queryAllByTestId("fun-fact")).toHaveLength(count));
    expect(document.querySelectorAll('[id^="chart-funfact-"]')).toHaveLength(count);
    for (const fact of facts) expect(screen.getByText(`${fact.title}: ${fact.fact}`)).toBeInTheDocument();
  });

  it("omits the optional cards if their request fails without hiding the other charts", async () => {
    service.getFunFacts.mockRejectedValueOnce(new Error("Unavailable"));
    const client = renderPage(false);
    await waitFor(() => expect(client.getQueryState(["stats", "fun-facts", "en", 4])?.status).toBe("error"));
    expect(screen.queryAllByTestId("fun-fact")).toHaveLength(0);
    expect(screen.getByText("Hotspot chart")).toBeInTheDocument();
  });
});

const reportRange = { startDate: "2026-01-01", endDate: "2026-11-07" };
const exportActions = () => within(document.querySelector("header")!);
async function submitExport(label: string) {
  await userEvent.click(exportActions().getByRole("button", { name: label }));
  await selectDate("Start date", reportRange.startDate);
  await selectDate("End date", reportRange.endDate);
  await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: label }));
}

describe("independent report exports", () => {
  it("exports without requesting a summary even if a chart cannot load", async () => {
    service.getTrashComposition.mockRejectedValueOnce(new Error("Unavailable"));
    service.getStatsSummary.mockRejectedValue(new Error("Summary unavailable"));
    const client = renderPage(false);
    await waitFor(() => expect(client.getQueryState(["stats", "trash-composition"])?.status).toBe("error"));

    await submitExport("Export Manifest");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await submitExport("Export PDF");
    await waitFor(() => {
      expect(service.exportCleanupManifest).toHaveBeenCalledWith(reportRange, "en");
      expect(service.exportCleanupManifestPdf).toHaveBeenCalledWith(reportRange, "en");
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    });
    expect(service.getStatsSummary).not.toHaveBeenCalled();
  });

  it.each([
    { label: "Export Manifest", other: "Export PDF", exportRequest: service.exportCleanupManifest },
    { label: "Export PDF", other: "Export Manifest", exportRequest: service.exportCleanupManifestPdf },
  ])("only disables $label while its own request is pending", async ({ label, other, exportRequest }) => {
    let resolve!: (value: { blob: Blob; filename: string }) => void;
    exportRequest.mockReturnValueOnce(new Promise(done => { resolve = done; }));
    renderPage();
    await submitExport(label);
    expect(exportActions().getByRole("button", { name: `${label}...` })).toBeDisabled();
    expect(exportActions().getByRole("button", { name: other })).toBeEnabled();
    await userEvent.click(exportActions().getByRole("button", { name: `${label}...` }));
    expect(exportRequest).toHaveBeenCalledTimes(1);
    await act(async () => { resolve({ blob: new Blob(["xlsx"]), filename: "manifest.xlsx" }); });
    await waitFor(() => expect(exportActions().getByRole("button", { name: label })).toBeEnabled());
  });
});

it("describes processing latency as a mean rather than a median", () => {
  renderPage();
  expect(screen.getByText(/Shows mean operational latency/)).toBeInTheDocument();
  expect(screen.queryByText(/median/i)).not.toBeInTheDocument();
});
