import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { SignupForm } from "./SignupForm";

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
        "signup.form.fullNameLabel": "Full Name",
        "signup.form.fullNamePlaceholder": "Enter your full name",
        "signup.form.emailLabel": "Email",
        "signup.form.emailPlaceholder": "Enter your email",
        "signup.form.passwordLabel": "Password",
        "signup.form.passwordPlaceholder": "Enter your password",
        "signup.form.creatingAccount": "Creating account...",
        "signup.form.submit": "Sign Up",
        "signup.form.haveAccount": "Already have an account?",
        "signup.form.login": "Sign in",
        "auth.validation.invalidEmail": "Invalid email",
        "auth.validation.emailRequired": "Email is required",
        "auth.validation.passwordMinLength": "Password must be at least 8 characters",
        "auth.validation.fullNameRequired": "Full name is required",
      };
      return translations[key] || key;
    },
    i18n: { resolvedLanguage: "en" },
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("SignupForm", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    useAuthMock.mockReturnValue({
      signup: vi.fn(),
      isLoading: false,
    });
  });

  it("renders signup form with all required fields", () => {
    renderWithRouter(<SignupForm />);

    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign Up/i })).toBeInTheDocument();
  });

  it("renders login link", () => {
    renderWithRouter(<SignupForm />);

    const loginLink = screen.getByRole("link", { name: /Sign in/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    const signupMock = vi.fn();
    useAuthMock.mockReturnValue({
      signup: signupMock,
      isLoading: false,
    });

    renderWithRouter(<SignupForm />);

    const fullNameInput = screen.getByPlaceholderText("Enter your full name");
    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const submitButton = screen.getByRole("button", { name: /Sign Up/i });

    await user.type(fullNameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "securePassword123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(signupMock).toHaveBeenCalledWith({
        full_name: "John Doe",
        email: "john@example.com",
        password: "securePassword123",
      });
    });
  });

  it("displays validation error for missing full name", async () => {
    const user = userEvent.setup();
    renderWithRouter(<SignupForm />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const submitButton = screen.getByRole("button", { name: /Sign Up/i });

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "securePassword123");
    await user.click(submitButton);

    expect(
      await screen.findByText("Full name is required"),
    ).toBeInTheDocument();
  });

  it("displays validation error for invalid email", async () => {
    const user = userEvent.setup();
    renderWithRouter(<SignupForm />);

    const fullNameInput = screen.getByPlaceholderText("Enter your full name");
    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const submitButton = screen.getByRole("button", { name: /Sign Up/i });

    await user.type(fullNameInput, "John Doe");
    await user.type(emailInput, "invalid-email");
    await user.type(passwordInput, "securePassword123");
    await user.click(submitButton);

    expect(await screen.findByText("Invalid email")).toBeInTheDocument();
  });

  it("displays validation error for missing password", async () => {
    const user = userEvent.setup();
    renderWithRouter(<SignupForm />);

    const fullNameInput = screen.getByPlaceholderText("Enter your full name");
    const emailInput = screen.getByPlaceholderText("Enter your email");
    const submitButton = screen.getByRole("button", { name: /Sign Up/i });

    await user.type(fullNameInput, "John Doe");
    await user.type(emailInput, "user@example.com");
    await user.click(submitButton);

    expect(
      await screen.findByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
  });

  it("displays validation error for short password", async () => {
    const user = userEvent.setup();
    renderWithRouter(<SignupForm />);

    const fullNameInput = screen.getByPlaceholderText("Enter your full name");
    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const submitButton = screen.getByRole("button", { name: /Sign Up/i });

    await user.type(fullNameInput, "John Doe");
    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "short");
    await user.click(submitButton);

    expect(
      await screen.findByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
  });

  it("disables submit button and shows loading text when creating account", async () => {
    const user = userEvent.setup();
    useAuthMock.mockReturnValue({
      signup: vi.fn(),
      isLoading: true,
    });

    renderWithRouter(<SignupForm />);

    const submitButton = screen.getByRole("button", {
      name: /Creating account/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it("validates all fields together", async () => {
    const user = userEvent.setup();
    renderWithRouter(<SignupForm />);

    const submitButton = screen.getByRole("button", { name: /Sign Up/i });
    await user.click(submitButton);

    expect(
      await screen.findByText("Full name is required"),
    ).toBeInTheDocument();
    // Empty email fails on .email() check first, so it shows "Invalid email"
    expect(
      await screen.findByText("Invalid email"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
  });

  it("calls signup hook only once when submitting valid form", async () => {
    const user = userEvent.setup();
    const signupMock = vi.fn();
    useAuthMock.mockReturnValue({
      signup: signupMock,
      isLoading: false,
    });

    renderWithRouter(<SignupForm />);

    const fullNameInput = screen.getByPlaceholderText("Enter your full name");
    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const submitButton = screen.getByRole("button", { name: /Sign Up/i });

    await user.type(fullNameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "securePassword123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(signupMock).toHaveBeenCalledTimes(1);
    });
  });
});
