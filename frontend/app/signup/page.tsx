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
import { signupSchema, type SignupFormValues } from "@/lib/validators";

export default function SignupPage() {
  const router = useRouter();
  const { signup, status } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isBootstrapping = useMemo(() => status === "loading", [status]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setErrorMessage(null);
    try {
      await signup(values);
      router.replace("/");
    } catch (error) {
      if (error instanceof ApiClientError && error.code === "DUPLICATE_EMAIL") {
        setErrorMessage("An account with this email already exists.");
        return;
      }

      setErrorMessage("Unable to create the account right now.");
    }
  });

  return (
    <AuthScreen
      eyebrow="Create account"
      title="Start a new TaskFlow session"
      subtitle="Set up a workspace identity now and move straight into the dashboard."
      footerPrompt="Already have an account?"
      footerLinkLabel="Sign in"
      footerHref="/login"
    >
      <form className="grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-[color:var(--foreground)]" htmlFor="name">
            Name
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            {...form.register("name")}
          />
          {form.formState.errors.name ? (
            <p className="text-sm text-[#a12622]">
              {form.formState.errors.name.message}
            </p>
          ) : null}
        </div>

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
            autoComplete="new-password"
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
          {form.formState.isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthScreen>
  );
}
