import { createFileRoute } from "@tanstack/react-router";
import { PostsPage } from "@/features/posts/components/posts-page";
import { postsSearchSchema } from "@/features/posts/schemas";

// register this file as the handler for the "/posts" URL
export const Route = createFileRoute("/_dashboard/posts")({
  validateSearch: postsSearchSchema,
  component: PostsPage,
});