export interface UserData {
  id: string;
  email: string;
  password: string;
  full_name: string;
  language: string;
}

export type AuthenticatedUser = Omit<UserData, "password">;
