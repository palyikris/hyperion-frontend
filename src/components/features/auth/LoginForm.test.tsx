import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { LoginForm } from "./LoginForm";

const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
}));

vi.mock("../../../hooks/auth/useAuth", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "login.form.emailLabel": "Email",
        "login.form.emailPlaceholder": "Enter your email",
        "login.form.passwordLabel": "Password",
        "login.form.passwordPlaceholder": "Enter your password",
        "login.form.recovery": "Forgot password?",
        "login.form.loggingIn": "Logging in...",
        "login.form.submit": "Sign In",
        "login.form.noAccount": "Don't have an account?",
        "login.form.signup": "Sign up",
        "auth.validation.invalidEmail": "Invalid email",
        "auth.validation.emailRequired": "Email is required",
        "auth.validation.passwordMinLength": "Password must be at least 8 characters",
      };
      return translations[key] || key;
    },
    i18n: { resolvedLanguage: "en" },
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("LoginForm", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    useAuthMock.mockReturnValue({
      login: vi.fn(),
      isLoading: false,
    });
  });

  it("renders login form with email and password fields", () => {
    renderWithRouter(<LoginForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
  });

  it("renders signup link", () => {
    renderWithRouter(<LoginForm />);

    const signupLink = screen.getByRole("link", { name: /Sign up/i });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute("href", "/signup");
  });

  it("renders password recovery link when there's no error", () => {
    renderWithRouter(<LoginForm />);

    const recoveryLink = screen.getByRole("link", { name: /Forgot password/i });
    expect(recoveryLink).toBeInTheDocument();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    const loginMock = vi.fn();
    useAuthMock.mockReturnValue({
      login: loginMock,
      isLoading: false,
    });

    renderWithRouter(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "validPassword123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "validPassword123",
      });
    });
  });

  it("displays validation error for invalid email", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");

    await user.type(emailInput, "invalid-email");
    await user.type(passwordInput, "validPassword123");
    await user.click(document.body); // Blur to trigger validation

    await waitFor(() => {
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });
  });

  it("displays validation error for missing password", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    await user.type(emailInput, "user@example.com");
    await user.click(submitButton);

    expect(
      await screen.findByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
  });

  it("displays validation error for short password", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "short");
    await user.click(submitButton);

    expect(
      await screen.findByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
  });

  it("disables submit button and shows loading text when logging in", async () => {
    const user = userEvent.setup();
    useAuthMock.mockReturnValue({
      login: vi.fn(),
      isLoading: true,
    });

    renderWithRouter(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /Logging in/i });
    expect(submitButton).toBeDisabled();
  });

  it("hides password recovery link when password has error", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginForm />);

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    // Trigger validation error by entering short password and submitting
    await user.type(passwordInput, "short");
    await user.click(submitButton);

    await waitFor(() => {
      const recoveryLink = screen.queryByRole("link", {
        name: /Forgot password/i,
      });
      expect(recoveryLink).not.toBeInTheDocument();
    });
  });

  it("enables password recovery link when password is valid", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginForm />);

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    await user.type(passwordInput, "validPassword123");
    await user.click(document.body); // Blur to trigger validation

    await waitFor(() => {
      const recoveryLink = screen.getByRole("link", {
        name: /Forgot password/i,
      });
      expect(recoveryLink).toBeInTheDocument();
    });
  });
});
