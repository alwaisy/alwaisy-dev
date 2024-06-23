// app/providers.tsx
"use client";
import NextTopLoader from "nextjs-toploader";

import { colors } from "@/styles/colors";
import { NextUIProvider } from "@nextui-org/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <NextTopLoader color={colors["green-400"]} />
      {children}
    </NextUIProvider>
  );
}
