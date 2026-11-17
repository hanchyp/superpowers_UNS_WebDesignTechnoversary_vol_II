"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { siteLinks } from "@/lib/siteLinks";
import { Logo } from "./Brand";
import { Icon } from "./Icon";

export function LandingNav({ desktopAccount, mobileName, mobileAccount }: {
  desktopAccount: ReactNode;
  mobileName: ReactNode;
  mobileAccount: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  // Transparan di atas video hero; begitu digulir jadi bar putih seperti header halaman lain.
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const update = () => setSolid(window.scrollY > 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const light = solid || open;

  return (
    <header
      data-solid={light}
      className={`group/nav fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300 ${
        light ? "border-b border-line bg-white/95 shadow-[0_4px_20px_-12px_rgb(19_38_27/0.25)] backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className={`mx-auto flex max-w-[1312px] items-center justify-between px-5 transition-[height] duration-300 md:px-8 ${light ? "h-16 md:h-[72px]" : "h-20 md:h-24"}`}>
        <Logo tone={light ? "color" : "white"} wordmark />
        <nav className="hidden items-center gap-9 md:flex" aria-label="Utama">
          {siteLinks.map((l) => (
            <Link key={l.label} href={l.href} className={`text-base font-semibold transition-colors ${light ? "text-ink hover:text-leaf" : "text-white/95 hover:text-white"}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          {desktopAccount}
        </div>
        {mobileName}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`grid h-11 w-11 place-items-center rounded-full border transition-colors md:hidden ${
            light ? "border-line bg-white text-ink" : "border-white/40 bg-white/15 text-white"
          }`}
          aria-expanded={open}
          aria-label={open ? "Tutup menu" : "Buka menu"}
        >
          <Icon name={open ? "x" : "menu"} size={22} />
        </button>
      </div>
      {open && (
        <div className="mx-4 mb-3 rounded-3xl bg-white p-3 shadow-float md:hidden">
          {siteLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-4 py-3 text-base font-bold text-ink hover:bg-tint"
            >
              {l.label}
            </Link>
          ))}
          {mobileAccount}
        </div>
      )}
    </header>
  );
}
