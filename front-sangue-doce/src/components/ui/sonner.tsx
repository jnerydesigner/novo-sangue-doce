"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      closeButton
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast: "border-line bg-card text-ink shadow-editorial",
          title: "text-sm font-bold text-ink",
          description: "text-sm text-inkSoft",
          actionButton: "bg-green text-white",
          cancelButton: "bg-paper2 text-inkSoft",
        },
      }}
      {...props}
    />
  );
}
