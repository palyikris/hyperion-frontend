import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userReducer, { setUser } from "../../store/userSlice";
import type { AuthenticatedUser } from "../../types/auth/auth";
import SideNav from "../../components/layout/SideNav";
import { useAuth } from "./useAuth";
import { useMeAuth } from "./useMeAuth";

const { login, logout, getMe, navigate, showError } = vi.hoisted(() => ({
  login: vi.fn(), logout: vi.fn(), getMe: vi.fn(), navigate: vi.fn(), showError: vi.fn(),
}));

vi.mock("../../services/authService", () => ({
  authService: { login, logout, signup: vi.fn() },
}));
vi.mock("../../api/axiosInstance", () => ({ api: { get: getMe } }));
vi.mock("../../services/toastService", () => ({
  toastService: { success: vi.fn(), error: showError },
}));
vi.mock("react-router-dom", async () => ({
  ...await vi.importActual("react-router-dom"), useNavigate: () => navigate,
}));
vi.mock("../../components/layout/NavMenuLinks", () => ({ default: () => null }));
vi.mock("../../components/layout/NavLogo", () => ({ default: () => null }));

const oldUser: AuthenticatedUser = {
  id: "old-user", email: "old@example.test", full_name: "Old User", language: "en",
};
const newUser: AuthenticatedUser = {
  id: "new-user", email: "new@example.test", full_name: "New User", language: "hu",
};
const privateKeys = [
  ["vault", { page: 1 }], ["map-data", {}], ["stats", "summary", 7],
  ["media", "old-media"], ["video", "old-video"], ["upload", "recent-gallery"],
];
const clients: QueryClient[] = [];

function context() {
  const store = configureStore({ reducer: { user: userReducer } });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clients.push(client);
  store.dispatch(setUser(oldUser));
  localStorage.setItem("user", JSON.stringify(oldUser));
  client.setQueryData(["authUser"], oldUser);
  for (const key of privateKeys) client.setQueryData(key, { owner: oldUser.id });
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={["/dashboard"]}>{children}</MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
  return { store, client, wrapper };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  login.mockResolvedValue({ user: newUser });
  logout.mockResolvedValue(undefined);
});
afterEach(() => {
  for (const client of clients.splice(0)) client.clear();
  vi.restoreAllMocks();
});

describe("authentication session boundaries", () => {
  it("clears Redux, storage and all private queries on successful logout", async () => {
    const { store, client, wrapper } = context();
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.logout());
    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/login", { replace: true }));
    expect(store.getState().user.user).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(client.getQueryData(["authUser"])).toBeNull();
    for (const key of privateKeys) expect(client.getQueryData(key)).toBeUndefined();
  });

  it("replaces the previous identity and cache when a different user logs in", async () => {
    const { store, client, wrapper } = context();
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.login({ email: newUser.email, password: "test-password" }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/dashboard", { replace: true }));
    expect(store.getState().user.user).toEqual(newUser);
    expect(client.getQueryData(["authUser"])).toEqual(newUser);
    expect(localStorage.getItem("user")).toBeNull();
    for (const key of privateKeys) expect(client.getQueryData(key)).toBeUndefined();
  });

  it("does not let an old in-flight query repopulate the new user's cache", async () => {
    const { client, wrapper } = context();
    const oldRequest = deferred<{ owner: string }>();
    let requestSignal: AbortSignal | undefined;
    const pending = client.fetchQuery({
      queryKey: ["old-private-request"],
      queryFn: ({ signal }) => { requestSignal = signal; return oldRequest.promise; },
    }).catch(() => undefined);
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.login({ email: newUser.email, password: "test-password" }));
    await waitFor(() => expect(client.getQueryData(["authUser"])).toEqual(newUser));
    expect(requestSignal?.aborted).toBe(true);
    oldRequest.resolve({ owner: oldUser.id });
    await pending;
    expect(client.getQueryData(["old-private-request"])).toBeUndefined();
    expect(client.getQueryData(["authUser"])).toEqual(newUser);
  });

  it("cancels a pending identity request before installing the new identity", async () => {
    const { client, wrapper } = context();
    client.removeQueries({ queryKey: ["authUser"] });
    const oldRequest = deferred<{ data: AuthenticatedUser }>();
    getMe.mockReturnValueOnce(oldRequest.promise);
    const { result } = renderHook(() => ({ auth: useAuth(), me: useMeAuth() }), { wrapper });
    await waitFor(() => expect(getMe).toHaveBeenCalledOnce());
    const signal = getMe.mock.calls[0][1].signal as AbortSignal;
    act(() => result.current.auth.login({ email: newUser.email, password: "test-password" }));
    await waitFor(() => expect(client.getQueryData(["authUser"])).toEqual(newUser));
    expect(signal.aborted).toBe(true);
    await act(async () => { oldRequest.resolve({ data: oldUser }); });
    expect(client.getQueryData(["authUser"])).toEqual(newUser);
  });

  it("preserves the current session when the server rejects logout", async () => {
    const { store, client, wrapper } = context();
    vi.spyOn(console, "error").mockImplementation(() => {});
    logout.mockRejectedValueOnce(new Error("Network unavailable"));
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.logout());
    await waitFor(() => expect(showError).toHaveBeenCalledOnce());
    expect(store.getState().user.user).toEqual(oldUser);
    expect(client.getQueryData(["authUser"])).toEqual(oldUser);
    expect(localStorage.getItem("user")).toBe(JSON.stringify(oldUser));
    expect(navigate).not.toHaveBeenCalled();
  });

  it("uses the same cleanup from the sidebar and disables logout while pending", async () => {
    const { store, client, wrapper } = context();
    const pending = deferred<void>();
    logout.mockReturnValueOnce(pending.promise);
    render(<SideNav />, { wrapper });
    const button = screen.getByRole("button", { name: "nav.logout" });
    await userEvent.click(button);
    expect(button).toBeDisabled();
    await act(async () => { pending.resolve(); });
    await waitFor(() => expect(store.getState().user.user).toBeNull());
    expect(client.getQueryData(["authUser"])).toBeNull();
    for (const key of privateKeys) expect(client.getQueryData(key)).toBeUndefined();
    expect(screen.queryByText(oldUser.full_name)).not.toBeInTheDocument();
    expect(navigate).toHaveBeenCalledWith("/login", { replace: true });
  });
});
