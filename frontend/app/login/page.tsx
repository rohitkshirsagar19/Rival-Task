"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";

import { AuthScreen } from "@/components/auth/AuthScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { ApiClientError } from "@/lib/api";
import { loginSchema, type LoginFormValues } from "@/lib/validators";

export default function LoginPage() {
  const router = useRouter();
  const { login, status } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isBootstrapping = useMemo(() => status === "loading", [status]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setErrorMessage(null);
    try {
      await login(values);
      router.replace("/");
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        error.code === "INVALID_CREDENTIALS"
      ) {
        setErrorMessage("Email or password is incorrect.");
        return;
      }

      setErrorMessage("Unable to complete login right now.");
    }
  });

  return (
    <AuthScreen
      eyebrow="Sign in"
      title="Return to your workspace"
      subtitle="Use the same account that owns your task stream and dashboard session."
      footerPrompt="Need an account?"
      footerLinkLabel="Create one"
      footerHref="/signup"
    >
      <form className="grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-[color:var(--foreground)]" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-[#a12622]">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-[color:var(--foreground)]" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Minimum 8 characters"
            autoComplete="current-password"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="text-sm text-[#a12622]">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-[#f4c5bf] bg-[#fff5f3] px-4 py-3 text-sm text-[#8f2d18]">
            {errorMessage}
          </div>
        ) : null}

        <Button
          type="submit"
          className="mt-2 w-full"
          disabled={form.formState.isSubmitting || isBootstrapping}
        >
          {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthScreen>
  );
}
