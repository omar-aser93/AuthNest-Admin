import { queryOptions, keepPreviousData, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PostsListResponse, PostsSearch } from "./types";

// ─── Query keys ──────────────────────────────────────────────────────────────
export const postsKeys = {
  all: ["admin", "posts"] as const,
  list: (filters: PostsSearch) => [...postsKeys.all, "list", filters] as const,
};


// ─── Fetch list ──────────────────────────────────────────────────────────────
async function fetchPosts(filters: PostsSearch): Promise<PostsListResponse> {
  const params = new URLSearchParams();
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.privacy && filters.privacy !== "all") params.set("privacy", filters.privacy);
  params.set("sort", filters.sort);
  params.set("order", filters.order);

  const res = await api.get(`/admin/posts?${params.toString()}`);
  return res.data;
}

export const postsQueryOptions = (filters: PostsSearch) =>
  queryOptions({
    queryKey: postsKeys.list(filters),
    queryFn: () => fetchPosts(filters),
    placeholderData: keepPreviousData,
  });



// ─── Delete post ─────────────────────────────────────────────────────────────
async function deletePostRequest(id: string): Promise<void> {
  await api.delete(`/admin/posts/${id}`);
}

export function useDeletePost() {
  return useMutation({ mutationFn: deletePostRequest });
}