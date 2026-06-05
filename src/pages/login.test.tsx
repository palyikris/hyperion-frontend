import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./login";

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
        "login.page.authImageAlt": "Forest authentication background",
        "login.page.logoAlt": "Hyperion logo",
        "login.page.brand": "HYPERION",
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
        "auth.validation.passwordMinLength":
          "Password must be at least 8 characters",
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

vi.mock("../components/shared/decoration", () => ({
  Blob: () => <div data-testid="blob" />,
  blobShapes: {},
}));

vi.mock("../components/features/auth/LoginForm", () => ({
  LoginForm: () => <form data-testid="login-form">Login Form</form>,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    BrowserRouter: ({ children }: any) => <div>{children}</div>,
  };
});

describe("LoginPage", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    useAuthMock.mockReturnValue({
      login: vi.fn(),
      isLoading: false,
    });
  });

  it("renders login page with title", () => {
    render(<LoginPage />);

    expect(screen.getByText("HYPERION")).toBeInTheDocument();
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("displays image loading state initially", () => {
    render(<LoginPage />);

    expect(screen.getByText("LOADING...")).toBeInTheDocument();
  });

  it("renders forest background images", () => {
    const { container } = render(<LoginPage />);

    const images = container.querySelectorAll('img[src="/forest.png"]');
    expect(images.length).toBeGreaterThan(0);
  });

  it("renders logo image", () => {
    render(<LoginPage />);

    const logo = screen.getByAltText("Hyperion logo") as HTMLImageElement;
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/logo.png");
  });

  it("renders blob decoration component", () => {
    render(<LoginPage />);

    expect(screen.getByTestId("blob")).toBeInTheDocument();
  });

  it("renders login form component", () => {
    render(<LoginPage />);

    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(screen.getByText("Login Form")).toBeInTheDocument();
  });

  it("has responsive layout structure with min-h-screen and flex", () => {
    const { container } = render(<LoginPage />);

    const mainContainer = container.querySelector(".min-h-screen");
    expect(mainContainer).toBeTruthy();
    expect(mainContainer?.className).toContain("flex");
  });

  it("applies layout styling to forest images", () => {
    const { container } = render(<LoginPage />);

    const forestImages = container.querySelectorAll(
      'img[src="/forest.png"]',
    ) as NodeListOf<HTMLImageElement>;

    // Verify images exist and are properly positioned
    expect(forestImages.length).toBeGreaterThan(0);
    forestImages.forEach((img) => {
      expect(img).toHaveAttribute("src", "/forest.png");
      // Images should have positioning classes applied
      expect(img.className.length).toBeGreaterThan(0);
    });
  });

  it("renders page without errors when auth hook is ready", () => {
    useAuthMock.mockReturnValue({
      login: vi.fn(),
      isLoading: false,
    });

    const { container } = render(<LoginPage />);
    expect(container).toBeTruthy();
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("maintains loading state on initial render", () => {
    render(<LoginPage />);

    const loadingText = screen.getByText("LOADING...");
    expect(loadingText).toBeInTheDocument();
    expect(loadingText).toHaveClass("text-hyperion-sage-mint");
  });

  it("renders multiple layout sections for responsive design", () => {
    const { container } = render(<LoginPage />);

    // Check for left column (hidden on mobile)
    const leftColumn = container.querySelector(".hidden");
    expect(leftColumn).toBeInTheDocument();

    // Check for right column with form
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("renders all required interactive elements", () => {
    render(<LoginPage />);

    // Form is present
    expect(screen.getByTestId("login-form")).toBeInTheDocument();

    // Logo is present
    expect(screen.getByAltText("Hyperion logo")).toBeInTheDocument();

    // Title is present
    expect(screen.getByText("HYPERION")).toBeInTheDocument();

    // Blob decoration is present
    expect(screen.getByTestId("blob")).toBeInTheDocument();
  });
});
