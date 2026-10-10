import { LoginPage } from "@/features/auth/components/login-page";
import { createFileRoute } from "@tanstack/react-router";

// register this file as the handler for the "/login" URL, only add "/" at the end "/login/" if it's inside a route folder "routes/login/index.tsx"
export const Route = createFileRoute("/login")({
  component: LoginPage,
});

