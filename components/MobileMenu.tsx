"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { siteLinks } from "@/lib/siteLinks";
import { Icon } from "./Icon";

/** Menu navigasi utama untuk layar kecil di bar atas halaman alat. */
export function MobileMenu({ activeHref }: { activeHref?: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink hover:bg-tint"
        aria-expanded={open}
        aria-label={open ? "Tutup menu" : "Buka menu"}
      >
        <Icon name={open ? "x" : "menu"} size={20} />
      </button>
      {open && (
        <nav
          aria-label="Utama"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 rounded-2xl border border-line bg-white p-1.5 shadow-float"
        >
          {[{ href: "/", label: "Beranda" }, ...siteLinks, { href: "/laporan-saya", label: "Laporan saya" }].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={activeHref === l.href ? "page" : undefined}
              className={`block rounded-xl px-3.5 py-2.5 text-[15px] font-bold ${
                activeHref === l.href ? "bg-sprout text-forest" : "text-ink hover:bg-tint"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
