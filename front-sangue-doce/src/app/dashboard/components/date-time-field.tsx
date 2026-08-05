"use client";

import { useEffect, useState } from "react";

export function getCurrentDateTimeLocal(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type DateTimeFieldProps = {
  defaultValue?: string;
  label?: string;
};

export function DateTimeField({
  defaultValue,
  label = "Data e hora",
}: DateTimeFieldProps) {
  const [value, setValue] = useState(() => defaultValue ?? getCurrentDateTimeLocal());

  useEffect(() => {
    if (defaultValue) return;

    const interval = window.setInterval(() => {
      setValue(getCurrentDateTimeLocal());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [defaultValue]);

  return (
    <label className="inline-flex min-w-[204px] flex-col rounded-lg border border-[#bad0e6] bg-white px-4 py-2 text-xs font-semibold text-[#55718f]">
      {label}
      <span className="relative mt-0.5 flex items-center">
        <input
          aria-label={label}
          className="block w-full border-0 p-0 pr-7 text-sm font-bold text-[#132e4d] outline-none"
          type="datetime-local"
          value={value}
          suppressHydrationWarning
          onChange={(event) => setValue(event.target.value)}
        />
      </span>
    </label>
  );
}
