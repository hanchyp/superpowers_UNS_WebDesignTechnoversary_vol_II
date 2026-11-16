"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { MobileTabBar } from "@/components/MobileTabBar";
import { Icon } from "@/components/Icon";

export type ReportState = "diperiksa" | "terbit" | "perlu-dilengkapi";

export function StatusView({ header, reportId, initial, autoAdvance }: { header: ReactNode; reportId: string; initial: ReportState; autoAdvance: boolean }) {
  const [state, setState] = useState<ReportState>(initial);

  // Simulasi demo: pemeriksaan AI selesai beberapa detik setelah halaman dibuka.
  useEffect(() => {
    if (!autoAdvance || state !== "diperiksa") return;
    const t = setTimeout(() => setState("terbit"), 15000);
    return () => clearTimeout(t);
  }, [autoAdvance, state]);

  return (
    <div className="flex min-h-[100svh] flex-col bg-tint">
      {header}
      {state === "terbit" ? <Published /> : <Checking reportId={reportId} state={state} />}
      <MobileTabBar active="laporan" />
    </div>
  );
}

function Checking({ reportId, state }: { reportId: string; state: Exclude<ReportState, "terbit"> }) {
  const needsFix = state === "perlu-dilengkapi";
  const checks = needsFix
    ? [
        { done: true, text: "Kelengkapan data" },
        { done: true, text: "Waktu dan lokasi wajar" },
        { done: false, warn: true, text: "Foto terlalu gelap untuk dinilai" },
      ]
    : [
        { done: true, text: "Kelengkapan data" },
        { done: true, text: "Waktu dan lokasi wajar" },
        { done: false, text: "Indikasi visual pada foto…" },
        { done: false, text: "Mencari kejadian serupa di sekitar titik" },
      ];

  return (
    <main className="relative flex flex-1 justify-center overflow-hidden px-4 pb-32 pt-6 md:pb-48 md:pt-14">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/maps/canopy-band.svg" alt="" className="pointer-events-none absolute bottom-0 left-0 hidden w-full opacity-90 md:block" />
      <section className="relative w-full max-w-[800px] rounded-[28px] border border-line bg-white p-5 shadow-soft md:p-9">
        <header className="flex items-center gap-4">
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl md:h-[72px] md:w-[72px]">
            <Image src="/photos/sebangau-rawa.jpg" alt="" fill sizes="72px" className="object-cover" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-[-0.02em] md:text-[28px]">Status laporan</h1>
            <p className="mt-1 text-xs font-medium text-ink-2 md:text-[13px]">
              No. {reportId} · Indikasi asap · Pulang Pisau · dikirim 14:32 WIB
            </p>
          </div>
        </header>

        <ol className="mt-7 flex md:mt-9" aria-label="Tahap laporan">
          {[
            { state: "done" as const, title: "Terkirim", note: "14:32 WIB" },
            {
              state: needsFix ? ("warn" as const) : ("active" as const),
              title: needsFix ? "Perlu dilengkapi" : "Diperiksa AI",
              note: needsFix ? "Diperiksa 14:33 WIB" : "Kurang dari 1 menit",
            },
            { state: "todo" as const, title: "Tampil di peta", note: "Setelah lolos" },
          ].map((st, i, all) => (
            <Step key={st.title} {...st} last={i === all.length - 1} />
          ))}
        </ol>

        <div className="mt-6 rounded-[20px] bg-[#f7faf5] p-5 md:mt-8 md:p-6">
          <div className="flex items-center justify-between">
            <p className={`text-lg font-extrabold ${needsFix ? "text-[#8a5a00]" : "text-ai-ink"}`}>
              {needsFix ? "Pemeriksaan butuh bantuanmu" : "Sedang diperiksa…"}
            </p>
            {!needsFix && <span className="text-xs font-semibold text-ink-2">biasanya &lt; 1 menit</span>}
          </div>
          <ul className="mt-3 space-y-2">
            {checks.map((c) => (
              <li key={c.text} className="flex items-center gap-2.5 text-[15px] font-semibold">
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                    c.done ? "bg-leaf text-white" : c.warn ? "bg-pending text-white" : "border-2 border-dashed border-ai"
                  }`}
                >
                  {c.done && <Icon name="check" size={14} strokeWidth={3} />}
                  {c.warn && <span className="text-xs font-extrabold">!</span>}
                </span>
                {c.text}
              </li>
            ))}
          </ul>
        </div>

        <p className={`mt-5 flex gap-2.5 rounded-2xl p-4 text-sm font-semibold leading-relaxed ${needsFix ? "bg-pending-soft text-[#6b4a00]" : "bg-ai-soft text-[#1f4e73]"}`}>
          <Icon name="info" size={19} className="shrink-0" />
          {needsFix
            ? "Ini bukan berarti pengamatanmu salah. Coba ambil foto yang lebih terang, atau kirim ke moderator untuk ditinjau manual."
            : "Laporanmu belum tampil di peta sampai pemeriksaan selesai."}
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          {needsFix ? (
            <>
              <Link href="/lapor" className="btn-report px-6 py-3.5 text-base font-extrabold shadow-none hover:translate-y-0 active:translate-y-0">
                Perbaiki foto
              </Link>
              <button type="button" className="px-4 py-3 text-[15px] font-bold text-leaf underline">
                Kirim ke moderator saja
              </button>
            </>
          ) : (
            <Link href="/pantau" className="btn-outline px-6 py-3.5 text-[15px]">
              Kembali ke peta
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}

function Step({ state, title, note, last }: { state: "done" | "active" | "warn" | "todo"; title: string; note: string; last: boolean }) {
  const circle = {
    done: "bg-leaf text-white",
    active: "border-2 border-leaf bg-white",
    warn: "border-2 border-pending bg-white",
    todo: "border-2 border-line bg-white",
  }[state];
  const titleColor = { done: "font-semibold text-ink-2", active: "font-bold text-ink", warn: "font-bold text-[#8a5a00]", todo: "font-medium text-stale" }[state];
  return (
    <li className="relative flex flex-1 flex-col items-center gap-2 text-center" aria-current={state === "active" || state === "warn" ? "step" : undefined}>
      {!last && (
        <span
          className={`absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-[13px] h-[2px] rounded-full ${state === "done" ? "bg-leaf" : "bg-line"}`}
          aria-hidden="true"
        />
      )}
      <span className={`grid h-7 w-7 place-items-center rounded-full ${circle}`}>
        {state === "done" && <Icon name="check" size={14} strokeWidth={3} />}
        {state === "active" && <span className="h-2.5 w-2.5 rounded-full bg-leaf" />}
        {state === "warn" && <span className="h-2.5 w-2.5 rounded-full bg-pending" />}
      </span>
      <span>
        <span className={`block text-[13px] md:text-sm ${titleColor}`}>{title}</span>
        <span className="block text-xs font-medium text-stale">{note}</span>
      </span>
    </li>
  );
}

function Published() {
  return (
    <main className="flex flex-1 justify-center px-4 pb-32 pt-6 md:pt-10">
      <section className="relative flex w-full max-w-[680px] flex-col items-center overflow-hidden rounded-[32px] bg-white px-6 pb-8 pt-10 md:px-12 text-center shadow-soft">
        {/* Maskot */}
        <div className="relative animate-badge-pop">
          <Image src="/mascot/care.png" alt="Maskot orang utan WANA mengacungkan jempol" width={210} height={210} sizes="210px" className="relative z-10 h-[210px] w-[210px] object-contain" />
          <span className="absolute bottom-2 left-1/2 h-4 w-32 -translate-x-1/2 rounded-[50%] bg-forest/15 blur-[2px]" aria-hidden="true" />
        </div>

        <h1 className="relative mt-6 text-[28px] font-extrabold leading-tight tracking-[-0.02em]">
          Laporan terbit, terima kasih!
        </h1>
        <p className="relative mt-2 max-w-[460px] text-[15px] md:text-base font-medium text-ink-2">
          Pengamatanmu sudah tampil di peta. Warga sekitar kini bisa melihat dan melengkapinya.
        </p>

        <div className="relative mt-8 flex w-full items-center gap-3.5 rounded-[20px] bg-[#f3f5f1] p-4 text-left">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-leaf">
            <Icon name="share" size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-extrabold">Ajak warga sekitar ikut memantau</span>
            <button type="button" className="mt-0.5 text-[13px] font-bold text-leaf underline">
              Bagikan laporan
            </button>
          </span>
        </div>

        <Link href="/kejadian/pulang-pisau" className="btn relative mt-5 w-full bg-forest py-4 text-base font-extrabold text-white hover:bg-forest-deep">
          Lihat kejadian di peta
        </Link>
        <Link href="/" className="relative mt-3 py-2 text-[15px] font-bold text-ink hover:text-leaf">
          Kembali ke beranda
        </Link>
      </section>
    </main>
  );
}
