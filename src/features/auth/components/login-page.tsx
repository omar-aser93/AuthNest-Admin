import { LoginForm } from "@/features/auth/components/login-form";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ModeToggle } from "@/components/theme/mode-toggle";

export function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="absolute top-4 inset-e-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ModeToggle />
      </div>

      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        <LoginForm />
      </div>
    </div>
  );
}