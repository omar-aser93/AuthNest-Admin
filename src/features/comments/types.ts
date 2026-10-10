export interface Comment {
  id: string;
  content: string;
  postId: string;
  parentId: string | null;
  reactionCount: number;
  replyCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  post: {
    id: string;
    title: string | null;
  };
}

export interface CommentsListResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CommentsSortField = "createdAt" | "reactionCount" | "replyCount";
export type CommentsSortOrder = "asc" | "desc";

export interface CommentsSearch {
  page: number;
  limit: number;
  search?: string;
  postId?: string;
  sort: CommentsSortField;
  order: CommentsSortOrder;
}