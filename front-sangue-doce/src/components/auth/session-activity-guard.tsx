"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

const protectedPathPrefixes = ["/admin", "/dashboard"];
const sessionCheckIntervalMs = 30_000;

function isProtectedPath(pathname: string) {
  return protectedPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function getLoginRedirectUrl() {
  const nextPath = `${window.location.pathname}${window.location.search}`;

  return `/login?next=${encodeURIComponent(nextPath)}`;
}

export function SessionActivityGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const checkingRef = useRef(false);
  const lastCheckAtRef = useRef(0);

  const expireSession = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.replace(getLoginRedirectUrl());
    router.refresh();
  }, [router]);

  const checkSession = useCallback(async () => {
    if (!isProtectedPath(pathname) || checkingRef.current) {
      return;
    }

    const now = Date.now();

    if (now - lastCheckAtRef.current < sessionCheckIntervalMs) {
      return;
    }

    checkingRef.current = true;
    lastCheckAtRef.current = now;

    try {
      const response = await fetch("/api/auth/profile", {
        cache: "no-store",
        method: "GET",
      });

      if (response.status === 401) {
        await expireSession();
      }
    } finally {
      checkingRef.current = false;
    }
  }, [expireSession, pathname]);

  useEffect(() => {
    if (!isProtectedPath(pathname)) {
      return;
    }

    const handleInteraction = () => {
      void checkSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkSession();
      }
    };

    window.addEventListener("pointerdown", handleInteraction, { capture: true, passive: true });
    window.addEventListener("keydown", handleInteraction, { capture: true });
    window.addEventListener("focus", handleInteraction);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pointerdown", handleInteraction, { capture: true });
      window.removeEventListener("keydown", handleInteraction, { capture: true });
      window.removeEventListener("focus", handleInteraction);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkSession, pathname]);

  return null;
}
