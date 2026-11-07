import { act, render, screen, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { Outlet } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import userReducer, { setUser } from "./store/userSlice";
import { mainNavLinks } from "./components/layout/navLinks";
import type { AuthenticatedUser } from "./types/auth/auth";

const { getMe } = vi.hoisted(() => ({ getMe: vi.fn() }));
vi.mock("./api/axiosInstance", () => ({ api: { get: getMe } }));
vi.mock("sonner", () => ({ Toaster: () => null }));
vi.mock("./i18n", () => ({ default: { language: "en", changeLanguage: vi.fn() } }));
vi.mock("./components/layout/MainLayout", () => ({ MainLayout: () => <Outlet /> }));
vi.mock("./components/shared/LoadingScreen", () => ({ default: () => <div>Checking session</div> }));
vi.mock("./pages/login", () => ({ default: () => <div>Login page</div> }));
vi.mock("./pages/signup", () => ({ default: () => <div>Signup page</div> }));
vi.mock("./pages/dashboard", () => ({ default: () => <div>Dashboard page</div> }));
vi.mock("./pages/vault", () => ({ default: () => <div>Vault page</div> }));
vi.mock("./pages/lab", () => ({ default: () => <div>Labor detail</div> }));
vi.mock("./pages/upload", () => ({ default: () => null }));
vi.mock("./pages/settings", () => ({ default: () => null }));
vi.mock("./pages/stats", () => ({ default: () => null }));
vi.mock("./pages/map", () => ({ MapPage: () => null }));

const user: AuthenticatedUser = {
  id: "test-user", email: "user@example.test", full_name: "Test User", language: "en",
};
const clients: QueryClient[] = [];

function renderAt(path: string, authenticated: boolean | "unverified" | "reload" = true) {
  window.history.replaceState({}, "", path);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clients.push(client);
  const store = configureStore({ reducer: { user: userReducer } });
  if (authenticated === "unverified") store.dispatch(setUser(user));
  else if (authenticated !== "reload") client.setQueryData(["authUser"], authenticated ? user : null);
  render(
    <Provider store={store}>
      <QueryClientProvider client={client}><App /></QueryClientProvider>
    </Provider>,
  );
  return { store, client };
}

beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });
afterEach(() => { for (const client of clients.splice(0)) client.clear(); });

describe("application routes and session guard", () => {
  it("restores the verified profile to Redux after a full page reload", async () => {
    getMe.mockResolvedValueOnce({ data: user });
    const { store, client } = renderAt("/dashboard", "reload");
    expect(store.getState().user.user).toBeNull();
    expect(await screen.findByText("Dashboard page")).toBeInTheDocument();
    await waitFor(() => expect(store.getState().user.user).toEqual(user));
    expect(client.getQueryData(["authUser"])).toEqual(user);
    expect(localStorage.getItem("user")).toBe(JSON.stringify(user));
  });

  it("synchronizes cached and subsequently updated profiles to Redux", async () => {
    const { store, client } = renderAt("/dashboard");
    await waitFor(() => expect(store.getState().user.user).toEqual(user));
    const updatedUser = { ...user, full_name: "Updated User" };
    act(() => { client.setQueryData(["authUser"], updatedUser); });
    await waitFor(() => expect(store.getState().user.user).toEqual(updatedUser));
    expect(localStorage.getItem("user")).toBe(JSON.stringify(updatedUser));
    expect(getMe).not.toHaveBeenCalled();
  });

  it("opens the Labor menu href directly as the authenticated Vault", async () => {
    const lab = mainNavLinks.find((link) => link.labelKey === "nav.main.lab");
    expect(lab).toBeDefined();
    renderAt(lab!.href);
    expect(await screen.findByText("Vault page")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/vault");
    expect(screen.queryByText("404")).not.toBeInTheDocument();
  });

  it("preserves the identifier-based Labor route", () => {
    renderAt("/lab/media-123");
    expect(screen.getByText("Labor detail")).toBeInTheDocument();
  });

  it("does not expose the Labor redirect to a signed-out user", async () => {
    renderAt("/lab", false);
    expect(await screen.findByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Vault page")).not.toBeInTheDocument();
  });

  it("does not accept a Redux-only user before the server verifies the session", async () => {
    let resolve!: (value: { data: AuthenticatedUser }) => void;
    getMe.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    renderAt("/dashboard", "unverified");
    expect(screen.getByText("Checking session")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard page")).not.toBeInTheDocument();
    await act(async () => { resolve({ data: user }); });
    expect(await screen.findByText("Dashboard page")).toBeInTheDocument();
  });

  it("redirects a rejected session even if Redux still contains an identity", async () => {
    getMe.mockRejectedValueOnce(new Error("Session expired"));
    localStorage.setItem("user", JSON.stringify(user));
    const { store } = renderAt("/dashboard", "unverified");
    await waitFor(() => expect(screen.getByText("Login page")).toBeInTheDocument());
    expect(screen.queryByText("Dashboard page")).not.toBeInTheDocument();
    expect(store.getState().user.user).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});
