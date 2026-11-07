import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PropsWithChildren } from "react";
import type { MapItem } from "../../../types/map";
import MarkerSidebar from "./MarkerSidebar";

const { navigate, getLogs, deleteMedia } = vi.hoisted(() => ({
  navigate: vi.fn(), getLogs: vi.fn(), deleteMedia: vi.fn(),
}));
vi.mock("react-router-dom", () => ({ useNavigate: () => navigate }));
vi.mock("../../../hooks/map/useMapLogs", () => ({ useMapLogs: getLogs }));
vi.mock("../../../hooks/vault/useDeleteVaultItem", () => ({
  useDeleteVaultItem: () => ({ mutate: deleteMedia, isPending: false }),
}));
vi.mock("framer-motion", () => ({ motion: {
  aside: ({ children }: PropsWithChildren) => <aside>{children}</aside>,
} }));
vi.mock("../../shared/ConfirmModal", () => ({
  default: ({ isOpen, onConfirm }: { isOpen: boolean; onConfirm: () => void }) =>
    isOpen ? <button onClick={onConfirm}>Confirm deletion</button> : null,
}));

const media: MapItem = {
  id: "video-parent", video_detection_id: "selected-detection",
  lat: 47, lng: 19, status: "READY", confidence: 90, has_trash: true,
  detections: [], filename: "video.mp4",
};
beforeEach(() => {
  vi.clearAllMocks();
  getLogs.mockReturnValue({ data: { history: [] }, isLoading: false });
});

describe("map marker action targets", () => {
  it("opens the selected video detection in Lab but loads its parent's logs", () => {
    render(<MarkerSidebar item={media} onClose={vi.fn()} />);
    expect(getLogs).toHaveBeenCalledWith("video-parent");
    fireEvent.click(screen.getByRole("button", { name: "Open Lab View" }));
    expect(navigate).toHaveBeenCalledWith("/lab/selected-detection");
  });

  it("keeps image Lab navigation unchanged", () => {
    render(<MarkerSidebar item={{ ...media, id: "image", video_detection_id: undefined }} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Open Lab View" }));
    expect(navigate).toHaveBeenCalledWith("/lab/image");
  });

  it("still targets the parent media, not the detection, for media deletion", () => {
    render(<MarkerSidebar item={media} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm deletion" }));
    expect(deleteMedia).toHaveBeenCalledWith("video-parent", expect.any(Object));
  });
});
