"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function AuthLink({ href, className, children }: {
  href: "/masuk" | "/daftar";
  className: string;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <Link
      href={href}
      className={className}
      onNavigate={(event) => {
        event.preventDefault();
        const { pathname, search, hash } = window.location;
        const params = new URLSearchParams({ kembali: pathname + search + hash });
        router.push(`${href}?${params}`);
      }}
    >
      {children}
    </Link>
  );
}
