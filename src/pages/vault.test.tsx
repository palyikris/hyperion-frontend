import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VaultPage from "./vault";

const {
  useVaultMock,
  useDeleteAllVaultMock,
  mutateMock,
} = vi.hoisted(() => ({
  useVaultMock: vi.fn(),
  useDeleteAllVaultMock: vi.fn(),
  mutateMock: vi.fn(),
}));

vi.mock("../hooks/vault/useVault", () => ({
  useVault: (...args: unknown[]) => useVaultMock(...args),
}));

vi.mock("../hooks/vault/useDeleteAllVault", () => ({
  useDeleteAllVault: () => useDeleteAllVaultMock(),
}));

vi.mock("../components/features/upload/Gallery", () => ({
  default: ({ items, onCardZoom }: any) => (
    <div>
      <div>Gallery with {items.length} item(s)</div>
      <button
        type="button"
        onClick={() => onCardZoom?.(items[0].id, items[0].hf_path)}
      >
        zoom first item
      </button>
    </div>
  ),
}));

vi.mock("../components/shared/ImageModal", () => ({
  default: ({ open, alt, imageUrl, onClose }: any) =>
    open ? (
      <div>
        <div>{`Image modal: ${alt} ${imageUrl}`}</div>
        <button type="button" onClick={onClose}>
          close image modal
        </button>
      </div>
    ) : null,
}));

vi.mock("../components/shared/LoadingScreen", () => ({
  default: () => <div>Loading vault</div>,
}));

vi.mock("../components/features/vault/VaultHeader", () => ({
  default: () => <h1>Vault</h1>,
}));

vi.mock("../components/features/vault/VaultFilters", () => ({
  default: ({
    onSearchChange,
    onStatusChange,
    onOrderByChange,
    onToggleDirection,
    onPageSizeChange,
  }: any) => (
    <div>
      <button type="button" onClick={() => onSearchChange("nebula")}>
        apply search filter
      </button>
      <button type="button" onClick={() => onStatusChange("READY")}>
        apply status filter
      </button>
      <button type="button" onClick={() => onOrderByChange("filename")}>
        apply sort change
      </button>
      <button type="button" onClick={onToggleDirection}>
        toggle sort direction
      </button>
      <button type="button" onClick={() => onPageSizeChange(50)}>
        apply page size
      </button>
    </div>
  ),
}));

vi.mock("../components/features/vault/VaultPagination", () => ({
  default: ({ onPageChange }: any) => (
    <button type="button" onClick={() => onPageChange(2)}>
      go to page 2
    </button>
  ),
}));

vi.mock("../components/features/vault/VaultEmptyState", () => ({
  default: () => <div>No vault items</div>,
}));

vi.mock("../components/shared/ConfirmModal", () => ({
  default: ({ isOpen, title, onConfirm, onClose }: any) =>
    isOpen ? (
      <div>
        <div>{title}</div>
        <button type="button" onClick={onConfirm}>
          confirm delete all
        </button>
        <button type="button" onClick={onClose}>
          close delete all
        </button>
      </div>
    ) : null,
}));

vi.mock("../components/shared/Divider", () => ({
  default: ({ label }: any) => <div>{label}</div>,
}));

vi.mock("../components/shared/decoration", () => ({
  PageAtmosphere: () => null,
}));

beforeEach(() => {
  useVaultMock.mockReset();
  useDeleteAllVaultMock.mockReset();
  mutateMock.mockReset();

  useVaultMock.mockReturnValue({
    data: {
      image_items: [
        {
          id: "img-1",
          hf_path: "/media/image-1.jpg",
        },
      ],
      video_items: [],
      total: 1,
      page: 1,
      page_size: 20,
      total_pages: 3,
    },
    isLoading: false,
  });

  useDeleteAllVaultMock.mockReturnValue({
    mutate: mutateMock,
    isPending: false,
  });
});

describe("VaultPage", () => {
  it("renders vault items and handles zoom/delete interactions", async () => {
    const user = userEvent.setup();

    render(<VaultPage />);

    expect(screen.getByText("Vault")).toBeInTheDocument();
    expect(screen.getByText("Delete All")).toBeInTheDocument();
    expect(screen.getByText("Gallery with 1 item(s)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "zoom first item" }));
    expect(
      screen.getByText("Image modal: img-1 /media/image-1.jpg"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete All" }));
    expect(screen.getByText("Delete All Media?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "confirm delete all" }));

    expect(mutateMock).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByText("Delete All Media?")).not.toBeInTheDocument();
    });
  });

  it("resets the page when vault filters change", async () => {
    const user = userEvent.setup();

    render(<VaultPage />);

    expect(useVaultMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        search: undefined,
        status: undefined,
        order_by: "created_at",
        direction: "desc",
        page_size: 20,
      }),
    );

    await user.click(screen.getByRole("button", { name: "go to page 2" }));

    expect(useVaultMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        page: 2,
        order_by: "created_at",
      }),
    );

    await user.click(screen.getByRole("button", { name: "apply search filter" }));

    expect(useVaultMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        page: 1,
        search: "nebula",
      }),
    );

    await user.click(screen.getByRole("button", { name: "toggle sort direction" }));

    expect(useVaultMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        page: 1,
        direction: "asc",
      }),
    );
  });
});