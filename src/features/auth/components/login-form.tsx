import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import { currentUserQueryOptions, useLogin } from "../api";
import { loginSchema, type LoginFormValues } from "../schemas";
import { useTranslation } from "react-i18next";

export function LoginForm() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const login = useLogin();

  const form = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "", remember: false } });

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: (data) => {
        queryClient.setQueryData(currentUserQueryOptions.queryKey, data.user);
        toast.add({ type: "success", title: t("auth.welcomeBack", { name: data.user.name ?? data.user.email }) });
        navigate({ to: "/" });
      },
      onError: (err) => {
        const message = err instanceof ApiError ? err.message : "Login failed";
        form.setError("root", { message });
      },
    });
  });

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <img src="/logo.png" alt="AuthNest" className="h-12 w-auto" />
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">{t("auth.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("auth.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <FieldGroup>
          {/* ── Email ────────────────────────────────────────────────────── */}
          <Controller control={form.control} name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("auth.email")}</FieldLabel>
                <Input id={field.name} type="email" autoComplete="email" placeholder="admin@example.com"
                  aria-invalid={fieldState.invalid} autoFocus {...field}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          {/* ── Password ─────────────────────────────────────────────────── */}
          <Controller control={form.control} name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("auth.password")}</FieldLabel>
                <Input id={field.name} type="password" autoComplete="current-password"
                  placeholder="••••••••" aria-invalid={fieldState.invalid} {...field}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          {/* ── Remember me ──────────────────────────────────────────────── */}
          <Controller control={form.control} name="remember"
            render={({ field }) => (
              <Field orientation="horizontal">
                <Checkbox id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                <FieldLabel htmlFor={field.name} className="font-normal">
                  {t("auth.rememberMe")}
                </FieldLabel>
              </Field>
            )}
          />

          {/* ── Root error (API-level) ───────────────────────────────────── */}
          {form.formState.errors.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          {/* ── Submit ───────────────────────────────────────────────────── */}
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? t("auth.signingIn") : t("auth.signIn")}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}