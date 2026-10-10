import { queryOptions, keepPreviousData, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CommentsListResponse, CommentsSearch } from "./types";

// ─── Query keys ──────────────────────────────────────────────────────────────
export const commentsKeys = {
  all: ["admin", "comments"] as const,
  list: (filters: CommentsSearch) => [...commentsKeys.all, "list", filters] as const,
};


// ─── Fetch list ──────────────────────────────────────────────────────────────
async function fetchComments(filters: CommentsSearch): Promise<CommentsListResponse> {
  const params = new URLSearchParams();
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.postId) params.set("postId", filters.postId);
  params.set("sort", filters.sort);
  params.set("order", filters.order);

  const res = await api.get(`/admin/comments?${params.toString()}`);
  return res.data;
}

export const commentsQueryOptions = (filters: CommentsSearch) =>
  queryOptions({
    queryKey: commentsKeys.list(filters),
    queryFn: () => fetchComments(filters),
    placeholderData: keepPreviousData,
  });


  
// ─── Delete comment ─────────────────────────────────────────────────────────────
async function deleteCommentRequest(id: string): Promise<void> {
  await api.delete(`/admin/comments/${id}`);
}

export function useDeleteComment() {
  return useMutation({ mutationFn: deleteCommentRequest });
}