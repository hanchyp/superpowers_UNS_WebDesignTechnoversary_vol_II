"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/Brand";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center gap-5 bg-tint px-6 text-center">
      <Logo />
      <h1 className="mt-6 text-3xl font-extrabold tracking-[-0.02em]">Halaman ini belum bisa dimuat</h1>
      <p className="max-w-[420px] text-base font-medium text-ink-2">
        Koneksi ke server sedang bermasalah. Coba muat ulang sebentar lagi. Untuk bahaya langsung, hubungi 112.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className="btn-primary px-6 py-3.5 text-base">
          Coba lagi
        </button>
        <Link href="/" className="rounded-full px-6 py-3.5 text-base font-bold text-leaf">
          Ke beranda
        </Link>
      </div>
    </main>
  );
}
