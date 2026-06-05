import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import UploadDropZone from "./UploadDropZone";
import { useUploadFiles } from "../../../hooks/upload/useUploadFiles";
import { useUploadVideoChunked } from "../../../hooks/upload/useUploadVideoChunked";

// Mock hooks
vi.mock("../../../hooks/upload/useUploadFiles", () => ({
  useUploadFiles: vi.fn(),
}));
vi.mock("../../../hooks/upload/useUploadVideoChunked", () => ({
  useUploadVideoChunked: vi.fn(),
}));

// Mock translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("UploadDropZone", () => {
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUploadFiles as any).mockReturnValue({ mutateAsync: mutateAsyncMock });
    (useUploadVideoChunked as any).mockReturnValue({
      mutateAsync: mutateAsyncMock,
    });
  });

  it("renders the dropzone correctly", () => {
    render(<UploadDropZone />);
    expect(screen.getByText(/upload.dropzone.heading/i)).toBeInTheDocument();
  });

  it("handles file selection via input change", async () => {
    render(<UploadDropZone />);
    const file = new File(["content"], "test.png", { type: "image/png" });
    const input = screen.getByLabelText(/upload.dropzone.fileSupport/i, {
      selector: "input",
    });

    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText("test.png")).toBeInTheDocument();
  });

  it("triggers upload when clicking the upload button", async () => {
    render(<UploadDropZone />);
    const file = new File(["content"], "test.png", { type: "image/png" });
    const input = screen.getByLabelText(/upload.dropzone.fileSupport/i, {
      selector: "input",
    });

    fireEvent.change(input, { target: { files: [file] } });

    const uploadButton = await screen.findByRole("button", {
      name: /nav.main.upload/i,
    });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalled();
    });
  });

  it("removes a file from the list", async () => {
    render(<UploadDropZone />);
    const file = new File(["content"], "test.png", { type: "image/png" });
    const input = screen.getByLabelText(/upload.dropzone.fileSupport/i, {
      selector: "input",
    });

    fireEvent.change(input, { target: { files: [file] } });

    const removeButton = await screen.findByTitle(/common.remove/i);
    fireEvent.click(removeButton);

    expect(screen.queryByText("test.png")).not.toBeInTheDocument();
  });
});
