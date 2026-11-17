"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Kelas warna genangan, biasanya versi lebih tua dari warna tombol. */
  fill?: string;
  /** Tanpa href, dirender sebagai <button>. */
  href?: string;
  type?: "button" | "submit";
};

/**
 * Tombol dengan efek "genangan": warna lebih tua menyebar dari titik kursor masuk,
 * lalu menyusut ke titik kursor keluar. Kelas tombol (ukuran, warna dasar) dari pemanggil;
 * jangan beri warna hover pada tombolnya, genangan inilah efek hovernya.
 */
export function RippleLink({ href, children, className = "", fill = "bg-[#f2ac00]", type = "button" }: Props) {
  const ref = useRef<HTMLElement>(null);

  const setOrigin = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--rx", `${e.clientX - r.left}px`);
    el.style.setProperty("--ry", `${e.clientY - r.top}px`);
  };

  const shared = {
    "data-ripple": "",
    onPointerEnter: setOrigin,
    onPointerLeave: setOrigin,
    className: `group relative isolate overflow-hidden [--rx:50%] [--ry:50%] ${className}`,
  };
  const inner = (
    <>
      <span
        className={`pointer-events-none absolute left-[var(--rx)] top-[var(--ry)] -z-10 aspect-square w-[260%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-focus-visible:scale-100 motion-reduce:transition-none ${fill}`}
        aria-hidden="true"
      />
      {children}
    </>
  );

  if (!href) {
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} type={type} {...shared}>
        {inner}
      </button>
    );
  }
  // Tautan dalam halaman, telepon, email, atau situs luar memakai <a> biasa.
  if (/^(#|tel:|mailto:|https?:)/.test(href)) {
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} {...shared}>
        {inner}
      </a>
    );
  }
  return (
    <Link ref={ref as React.Ref<HTMLAnchorElement>} href={href} {...shared}>
      {inner}
    </Link>
  );
}
