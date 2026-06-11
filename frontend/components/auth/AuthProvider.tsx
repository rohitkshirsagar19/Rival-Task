"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { ApiClientError, apiFetch } from "@/lib/api";
import type {
  AuthContextValue,
  AuthResponse,
  AuthUser,
  LoginInput,
  SignupInput,
} from "@/types/auth";

const PUBLIC_PATHS = new Set(["/login", "/signup"]);

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");

  const refreshSession = useCallback(async () => {
    try {
      const response = await apiFetch<AuthUser>("/api/v1/auth/me");
      setUser(response);
      setStatus("authenticated");
      return response;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        setUser(null);
        setStatus("unauthenticated");
        return null;
      }

      setUser(null);
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    apiFetch<AuthUser>("/api/v1/auth/me")
      .then((response) => {
        if (!active) {
          return;
        }
        setUser(response);
        setStatus("authenticated");
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        if (error instanceof ApiClientError && error.status === 401) {
          setUser(null);
          setStatus("unauthenticated");
          return;
        }
        setUser(null);
        setStatus("unauthenticated");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    const isPublic = PUBLIC_PATHS.has(pathname);

    if (status === "unauthenticated" && !isPublic) {
      router.replace("/login");
      return;
    }

    if (status === "authenticated" && isPublic) {
      router.replace("/");
    }
  }, [pathname, router, status]);

  const login = useCallback(async (values: LoginInput) => {
    const response = await apiFetch<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: values,
    });
    setUser(response.user);
    setStatus("authenticated");
    return response.user;
  }, []);

  const signup = useCallback(
    async (values: SignupInput) => {
      await apiFetch<AuthResponse>("/api/v1/auth/signup", {
        method: "POST",
        body: values,
      });
      return login({ email: values.email, password: values.password });
    },
    [login],
  );

  const logout = useCallback(async () => {
    await apiFetch<{ message: string }>("/api/v1/auth/logout", {
      method: "POST",
    });
    setUser(null);
    setStatus("unauthenticated");
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      signup,
      login,
      logout,
      refreshSession,
    }),
    [login, logout, refreshSession, signup, status, user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
