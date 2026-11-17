"use client";

import { useEffect } from "react";

const SELECTOR = ".btn, .btn-primary, .btn-outline, .btn-report, .btn-ghost-light";

/**
 * Mencatat titik kursor masuk/keluar pada setiap tombol, supaya efek genangan di globals.css
 * menyebar dari dan menyusut ke titik itu. Dipasang sekali di layout.
 */
export function ButtonRipple() {
  useEffect(() => {
    const mark = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(SELECTOR) as HTMLElement | null;
      if (!el || el.hasAttribute("data-ripple")) return;
      // Hanya saat benar-benar masuk/keluar tombol, bukan berpindah antar anak elemennya.
      if (e.relatedTarget instanceof Node && el.contains(e.relatedTarget)) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--rx", `${e.clientX - r.left}px`);
      el.style.setProperty("--ry", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointerover", mark, { passive: true });
    document.addEventListener("pointerout", mark, { passive: true });
    return () => {
      document.removeEventListener("pointerover", mark);
      document.removeEventListener("pointerout", mark);
    };
  }, []);
  return null;
}
