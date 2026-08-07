"use client";

import { useEffect, useState } from "react";

function formatDateTime(date: Date) {
  return {
    date: new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date),
  };
}

export function DateTimeCard() {
  const [dateTime, setDateTime] = useState<{ date: string; time: string }>();

  useEffect(() => {
    const update = () => setDateTime(formatDateTime(new Date()));
    update();
    const interval = window.setInterval(update, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex min-h-[60px] min-w-[232px] items-center justify-between rounded-lg border border-lineStrong bg-card px-4 py-2.5">
      <div className="grid gap-0.5">
        <span className="text-[12px] font-semibold text-muted">Data e hora</span>
        <span className="text-[15px] font-bold text-navy">
          {dateTime ? `${dateTime.date}, ${dateTime.time}` : "--/--/----, --:--"}
        </span>
      </div>
      <svg
        aria-hidden="true"
        className="h-4 w-4 text-ink"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M7 3v3m10-3v3M4.5 9.5h15M6 5h12a2 2 0 0 1 2 2v11.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    </div>
  );
}
