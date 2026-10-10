import { api } from "@/lib/api";
import type { SearchResult } from "./types";
import type { User, UsersListResponse } from "@/features/users/types";
import type { Post, PostsListResponse } from "@/features/posts/types";
import type { Comment, CommentsListResponse } from "@/features/comments/types";

const LIMIT_PER_TYPE = 5;

// ─── Users ───────────────────────────────────────────────────────────────────
async function searchUsers(q: string): Promise<SearchResult[]> {
  const res = await api.get<UsersListResponse>(
    `/admin/users?search=${encodeURIComponent(q)}&limit=${LIMIT_PER_TYPE}`,
  );
  return (res.data.users ?? []).map((u: User) => ({
    id: u.id,
    type: "user" as const,
    label: u.name ?? u.email,
    hint: u.email,
    image: u.image,
    href: "/users",
    params: { page: 1, limit: 20, sort: "createdAt", order: "desc" },
  }));
}

// ─── Posts ───────────────────────────────────────────────────────────────────
async function searchPosts(q: string): Promise<SearchResult[]> {
  const res = await api.get<PostsListResponse>(
    `/admin/posts?search=${encodeURIComponent(q)}&limit=${LIMIT_PER_TYPE}`,
  );
  return (res.data.posts ?? []).map((p: Post) => ({
    id: p.id,
    type: "post" as const,
    label: p.title || "Untitled",
    hint: p.content?.slice(0, 80) ?? "",
    image: p.author?.image,
    href: "/posts",
    params: { page: 1, limit: 20, sort: "createdAt", order: "desc" },
  }));
}

// ─── Comments ────────────────────────────────────────────────────────────────
async function searchComments(q: string): Promise<SearchResult[]> {
  const res = await api.get<CommentsListResponse>(
    `/admin/comments?search=${encodeURIComponent(q)}&limit=${LIMIT_PER_TYPE}`,
  );
  return (res.data.comments ?? []).map((c: Comment) => ({
    id: c.id,
    type: "comment" as const,
    label: c.content?.slice(0, 80) ?? "",
    hint: c.post?.title ?? c.user?.name ?? "",
    image: c.user?.image,
    href: "/comments",
    params: { page: 1, limit: 20, sort: "createdAt", order: "desc" },
  }));
}

// ─── Aggregate ───────────────────────────────────────────────────────────────
export async function runGlobalSearch(q: string): Promise<SearchResult[]> {
  if (q.trim().length < 2) return [];
  const [users, posts, comments] = await Promise.all([
    searchUsers(q).catch(() => [] as SearchResult[]),
    searchPosts(q).catch(() => [] as SearchResult[]),
    searchComments(q).catch(() => [] as SearchResult[]),
  ]);
  return [...users, ...posts, ...comments];
}