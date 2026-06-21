"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const logout = async () => {
    setSubmitting(true);

    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.replace("/login");
    router.refresh();
  };

  return (
    <button
      className="rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold text-inkSoft transition hover:-translate-y-px hover:bg-paper2 disabled:cursor-not-allowed disabled:opacity-65"
      disabled={submitting}
      onClick={logout}
      type="button"
    >
      {submitting ? "Saindo..." : "Sair"}
    </button>
  );
}
