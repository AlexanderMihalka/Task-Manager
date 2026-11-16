"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { api } from "./api";
import { clearToken, getToken } from "./auth";

// Захист сторінок: без токена відправляємо на /login.
// Недійсний токен відловить сам api-клієнт (відповідь 401).
export function useAuthGuard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setReady(true);

    let cancelled = false;
    api
      .me()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [router]);

  const logout = useCallback(() => {
    clearToken();
    router.replace("/login");
  }, [router]);

  return { ready, user, logout };
}
