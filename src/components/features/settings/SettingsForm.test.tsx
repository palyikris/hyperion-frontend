import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsForm } from "./SettingsForm";

const { getUser, update } = vi.hoisted(() => ({ getUser: vi.fn(), update: vi.fn() }));
vi.mock("../../../hooks/auth/useMeAuth", () => ({ useMeAuth: getUser }));
vi.mock("../../../hooks/auth/useUpdateMe", () => ({
  useUpdateMe: () => ({ mutate: update, isPending: false }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockReturnValue({ data: { full_name: "Test User", language: "hu" } });
});

describe("settings form validation", () => {
  it.each(["en", "hu"])("loads the saved %s language into the form", (language) => {
    getUser.mockReturnValue({ data: { full_name: "Test User", language } });
    render(<SettingsForm />);
    expect(screen.getByLabelText("settings.form.fullNameLabel")).toHaveValue("Test User");
    expect(screen.getByLabelText("settings.form.languageLabel")).toHaveValue(language);
  });

  it("does not submit a name consisting only of spaces", async () => {
    render(<SettingsForm />);
    const user = userEvent.setup();
    const name = screen.getByLabelText("settings.form.fullNameLabel");
    await user.clear(name);
    await user.type(name, "   ");
    await user.click(screen.getByRole("button", { name: "settings.form.submit" }));
    expect(await screen.findByText("settings.validation.fullNameRequired")).toBeInTheDocument();
    expect(update).not.toHaveBeenCalled();
  });

  it("submits a trimmed name and the selected supported language", async () => {
    render(<SettingsForm />);
    const user = userEvent.setup();
    const name = screen.getByLabelText("settings.form.fullNameLabel");
    await user.clear(name);
    await user.type(name, "  Updated  User  ");
    await user.selectOptions(screen.getByLabelText("settings.form.languageLabel"), "en");
    await user.click(screen.getByRole("button", { name: "settings.form.submit" }));
    await waitFor(() => expect(update).toHaveBeenCalledWith({
      full_name: "Updated  User", language: "en",
    }));
  });

  it("falls back to English if a saved language is unsupported", () => {
    getUser.mockReturnValue({ data: { full_name: "Test User", language: "de" } });
    render(<SettingsForm />);
    expect(screen.getByLabelText("settings.form.languageLabel")).toHaveValue("en");
  });
});
