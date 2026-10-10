import { createFileRoute } from "@tanstack/react-router";
import { CommentsPage } from "@/features/comments/components/comments-page";
import { commentsSearchSchema } from "@/features/comments/schemas";

// register this file as the handler for the "/comments" URL
export const Route = createFileRoute("/_dashboard/comments")({
  validateSearch: commentsSearchSchema,
  component: CommentsPage,
});