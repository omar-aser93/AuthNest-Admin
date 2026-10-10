import { createFileRoute } from "@tanstack/react-router";
import { UsersPage } from "@/features/users/components/users-page";
import { usersSearchSchema } from "@/features/users/schemas";

// register this file as the handler for the "/users" URL
export const Route = createFileRoute("/_dashboard/users")({
  validateSearch: usersSearchSchema,          // ← validate search params
  component: UsersPage,                       // ← page component
});