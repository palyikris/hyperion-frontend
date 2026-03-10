export const USER_STORAGE_KEY = "user";

export type StoredUser = {
  email?: string;
  full_name?: string;
  language?: string;
} & Record<string, unknown>;

export const getStoredUser = (): StoredUser => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);

    if (!rawUser) {
      return {};
    }

    const parsedUser = JSON.parse(rawUser);
    return parsedUser && typeof parsedUser === "object" ? parsedUser : {};
  } catch {
    return {};
  }
};

export const mergeStoredUser = (updates: Partial<StoredUser>): StoredUser => {
  const nextUser = {
    ...getStoredUser(),
    ...updates,
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  }

  return nextUser;
};