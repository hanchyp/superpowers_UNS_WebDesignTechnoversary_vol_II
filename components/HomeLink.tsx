"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { requestIntroReplay } from "@/lib/introReplay";

export function HomeLink({ className, ariaLabel, children }: {
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href="/"
      scroll={false}
      className={className}
      aria-label={ariaLabel}
      onClick={(e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        requestIntroReplay();
      }}
    >
      {children}
    </Link>
  );
}
