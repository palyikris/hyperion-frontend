import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import UploadPage from "./upload";

const { useRecentGalleryMock } = vi.hoisted(() => ({ useRecentGalleryMock: vi.fn() }));
vi.mock("../hooks/upload/useRecentGallery", () => ({ useRecentGallery: useRecentGalleryMock }));
vi.mock("../components/features/upload/UploadDropZone", () => ({ default: () => <input type="file" aria-label="Upload files" /> }));
vi.mock("../components/features/upload/Gallery", () => ({ default: () => <div>Recent gallery</div> }));
vi.mock("../components/shared/ImageModal", () => ({ default: () => null }));
vi.mock("../components/shared/decoration", () => ({ PageAtmosphere: () => null }));
vi.mock("../components/shared/Divider", () => ({ default: () => null }));
vi.mock("../components/shared/Title", () => ({ Title: ({ text }: { text: string }) => <h1>{text}</h1> }));

beforeEach(() => { useRecentGalleryMock.mockReset(); });

it("keeps uploads available while recent items load", () => {
  useRecentGalleryMock.mockReturnValue({ isLoading: true });
  render(<UploadPage />);
  expect(screen.getAllByLabelText("Upload files")).toHaveLength(2);
  expect(screen.getByRole("status")).toHaveTextContent("upload.recents.loading");
});

it("keeps uploads available after a gallery error and allows retrying", () => {
  const refetch = vi.fn();
  useRecentGalleryMock.mockReturnValue({ isError: true, refetch });
  render(<UploadPage />);
  expect(screen.getAllByLabelText("Upload files")).toHaveLength(2);
  expect(screen.getByRole("alert")).toHaveTextContent("upload.recents.error");
  fireEvent.click(screen.getByRole("button", { name: "upload.recents.retry" }));
  expect(refetch).toHaveBeenCalledOnce();
});
