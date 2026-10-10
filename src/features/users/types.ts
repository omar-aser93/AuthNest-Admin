export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "user" | "admin";
  isEmailVerified: boolean;
  createdAt: string;
  bannedAt: string | null;
  bannedReason: string | null;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type UsersSortField = "createdAt" | "name" | "email" | "role";
export type UsersSortOrder = "asc" | "desc";
export type UsersRoleFilter = "user" | "admin" | "all";

export interface UsersSearch {
  page: number;
  limit: number;
  search?: string;
  role?: UsersRoleFilter;
  sort: UsersSortField;
  order: UsersSortOrder;
}

