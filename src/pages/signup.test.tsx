import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignupPage from "./signup";

const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
}));

vi.mock("../hooks/auth/useAuth", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => {
      const translations: Record<string, string> = {
        "loading.status.lookingForTrash": "LOADING...",
        "signup.page.authImageAlt": "Forest authentication background",
        "signup.page.brand": "HYPERION",
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
      return translations[key] || defaultValue || key;
    },
  }),
}));

vi.mock("../components/shared/Title", () => ({
  Title: ({ text }: any) => <h1>{text}</h1>,
}));

vi.mock("../components/shared/animation/ScrollReveal", () => ({
  ScrollReveal: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock("../components/features/auth/SignupForm", () => ({
  SignupForm: () => <form data-testid="signup-form">Signup Form</form>,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    BrowserRouter: ({ children }: any) => <div>{children}</div>,
  };
});

describe("SignupPage", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    useAuthMock.mockReturnValue({
      signup: vi.fn(),
      isLoading: false,
    });
  });

  it("renders signup page with title", () => {
    render(<SignupPage />);

    expect(screen.getByText("HYPERION")).toBeInTheDocument();
    expect(screen.getByTestId("signup-form")).toBeInTheDocument();
  });

  it("displays image loading state initially", () => {
    render(<SignupPage />);

    expect(screen.getByText("LOADING...")).toBeInTheDocument();
  });

  it("renders forest background images", () => {
    const { container } = render(<SignupPage />);

    const images = container.querySelectorAll('img[src="/forest.png"]');
    expect(images.length).toBeGreaterThan(0);
  });

  it("renders signup form component", () => {
    render(<SignupPage />);

    expect(screen.getByTestId("signup-form")).toBeInTheDocument();
    expect(screen.getByText("Signup Form")).toBeInTheDocument();
  });

  it("has responsive layout structure with min-h-screen and flex", () => {
    const { container } = render(<SignupPage />);

    const mainContainer = container.querySelector(".min-h-screen");
    expect(mainContainer).toBeTruthy();
    expect(mainContainer?.className).toContain("flex");
  });

  it("renders page without errors when auth hook is ready", () => {
    useAuthMock.mockReturnValue({
      signup: vi.fn(),
      isLoading: false,
    });

    const { container } = render(<SignupPage />);
    expect(container).toBeTruthy();
    expect(screen.getByTestId("signup-form")).toBeInTheDocument();
  });

  it("maintains loading state on initial render", () => {
    render(<SignupPage />);

    const loadingText = screen.getByText("LOADING...");
    expect(loadingText).toBeInTheDocument();
    expect(loadingText).toHaveClass("text-hyperion-sage-mint");
  });

  it("displays brand title with correct structure", () => {
    render(<SignupPage />);

    const title = screen.getByText("HYPERION");
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe("H1");
  });

  it("renders signup form with proper wrapper structure", () => {
    render(<SignupPage />);

    const form = screen.getByTestId("signup-form");
    const formWrapper = form.closest("div");

    // Form should be wrapped in a container
    expect(formWrapper).toBeInTheDocument();
    // Wrapper should have content styling classes
    expect(formWrapper?.className.length).toBeGreaterThan(0);
  });

  it("renders multiple layout sections for responsive design", () => {
    const { container } = render(<SignupPage />);

    // Check for left column (hidden on smaller screens)
    const leftColumn = container.querySelector(".hidden");
    expect(leftColumn).toBeInTheDocument();

    // Check for right column with form
    expect(screen.getByTestId("signup-form")).toBeInTheDocument();
  });

  it("renders all required interactive elements", () => {
    render(<SignupPage />);

    // Form is present
    expect(screen.getByTestId("signup-form")).toBeInTheDocument();

    // Title is present
    expect(screen.getByText("HYPERION")).toBeInTheDocument();

    // Background images are present
    const { container } = render(<SignupPage />);
    expect(container.querySelectorAll('img[src="/forest.png"]').length).toBeGreaterThan(
      0,
    );
  });
});
