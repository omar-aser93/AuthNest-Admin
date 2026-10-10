export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "user" | "admin";
  isEmailVerified?: boolean;
  hasPassword?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginResponse {
  user: User;
  remember: boolean;
}