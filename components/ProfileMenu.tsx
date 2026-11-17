"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";

export function ProfileMenu({ name, email, signOut, tone = "light", compact = false }: {
  name: string;
  email?: string;
  signOut: () => Promise<void>;
  tone?: "light" | "dark";
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "W";

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

  const dark = tone === "dark";

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Menu akun ${name}`}
        className={`flex items-center gap-1.5 rounded-full p-1 pr-2.5 transition-colors sm:gap-2 sm:pr-3 ${
          dark
            ? "border border-white/40 bg-white/15 text-white hover:bg-white/25 group-data-[solid=true]/nav:border-line group-data-[solid=true]/nav:bg-white group-data-[solid=true]/nav:text-ink group-data-[solid=true]/nav:hover:bg-tint"
            : "border border-line bg-white text-ink hover:bg-tint"
        }`}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sun text-[13px] font-extrabold text-forest md:h-9 md:w-9">
          {initials}
        </span>
        {!compact && <span className="hidden max-w-32 truncate text-[15px] font-bold sm:block">{name}</span>}
        <Icon name="chevronDown" size={18} strokeWidth={2.5} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />

      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-2xl border border-line bg-white text-ink shadow-float"
        >
          <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sun text-sm font-extrabold text-forest">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold">{name}</p>
              {email && <p className="truncate text-[13px] font-medium text-ink-2">{email}</p>}
            </div>
          </div>
          <div className="border-b border-line p-1.5">
            <Link
              href="/laporan-saya"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[15px] font-bold text-ink hover:bg-tint"
            >
              <Icon name="inbox" size={18} />
              Laporan saya
            </Link>
          </div>
          <form
            action={async () => {
              setPending(true);
              await signOut();
            }}
            className="p-1.5"
          >
            <button
              type="submit"
              role="menuitem"
              disabled={pending}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[15px] font-bold text-fire-ink hover:bg-fire-soft disabled:opacity-60"
            >
              <Icon name="logout" size={18} />
              {pending ? "Keluar…" : "Keluar"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
