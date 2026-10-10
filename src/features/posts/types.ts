export interface Post {
  id: string;
  title: string | null;
  content: string | null;
  image: string | null;
  privacy: "PUBLIC" | "FRIENDS" | "ONLY_ME" | "CUSTOM";
  reactionCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface PostsListResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type PostsSortField = "createdAt" | "reactionCount" | "commentCount" | "shareCount";
export type PostsSortOrder = "asc" | "desc";
export type PostsPrivacyFilter = "PUBLIC" | "FRIENDS" | "ONLY_ME" | "CUSTOM" | "all";

export interface PostsSearch {
  page: number;
  limit: number;
  search?: string;
  privacy?: PostsPrivacyFilter;
  sort: PostsSortField;
  order: PostsSortOrder;
}