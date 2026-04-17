"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster position="top-right" richColors expand closeButton />
    </SessionProvider>
  );
}
