"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { MobileTabBar } from "@/components/MobileTabBar";
import { Icon } from "@/components/Icon";
import type { ReportStatus } from "@/lib/database.types";
import { refreshReportStatus } from "../actions";

export type StatusReport = {
  code: string;
  status: ReportStatus;
  checks: number;
  summary: string;
  sentAt: string;
  incident: { id: string; title: string } | null;
  cover: { url: string; kind: "foto" | "video" } | null;
};

export function StatusView({ header, report }: { header: ReactNode; report: StatusReport }) {
  const [status, setStatus] = useState(report.status);
  const [checks, setChecks] = useState(report.checks);
  const [incident, setIncident] = useState(report.incident);

  // Ambil status terbaru dari database: cepat selama diperiksa, pelan bila menunggu tindakan
  // (mis. status diubah manual dari dashboard). Berhenti setelah terbit/ditolak.
  useEffect(() => {
    if (status === "terbit" || status === "ditolak") return;
    const every = status === "diperiksa" ? 2000 : 10000;
    let alive = true;
    const t = setInterval(async () => {
      const next = await refreshReportStatus(report.code);
      if (!alive || !next) return;
      setStatus(next.status);
      setChecks(next.checks);
      if (next.incident) setIncident(next.incident);
    }, every);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [status, report.code]);

  return (
    <div className="flex min-h-[100svh] flex-col bg-tint">
      {header}
      {status === "terbit" ? <Published incident={incident} code={report.code} /> : <Checking report={report} status={status} checks={checks} />}
      <MobileTabBar active="laporan" />
    </div>
  );
}

function Checking({ report, status, checks: progress }: { report: StatusReport; status: Exclude<ReportStatus, "terbit">; checks: number }) {
  const needsFix = status === "perlu-dilengkapi";
  const rejected = status === "ditolak";
  const stopped = needsFix || rejected;
  const checks: { done: boolean; warn?: boolean; running?: boolean; text: string }[] = needsFix
    ? [
        { done: true, text: "Kelengkapan data" },
        { done: true, text: "Waktu dan lokasi wajar" },
        { done: false, warn: true, text: "Bukti belum cukup jelas untuk dinilai" },
      ]
    : rejected
      ? [
          { done: true, text: "Kelengkapan data" },
          { done: false, warn: true, text: "Laporan tidak memenuhi ketentuan WANA" },
        ]
      : [
          { done: true, text: "Kelengkapan data" },
          { done: true, text: "Waktu dan lokasi wajar" },
          { done: progress >= 1, text: progress >= 1 ? "Indikasi visual pada foto" : "Memeriksa indikasi visual pada foto" },
          { done: progress >= 2, text: progress >= 2 ? "Kejadian serupa di sekitar titik" : "Mencari kejadian serupa di sekitar titik" },
        ];
  // Pemeriksaan pertama yang belum selesai sedang berjalan.
  const runningIndex = stopped ? -1 : checks.findIndex((c) => !c.done);
  if (runningIndex >= 0) checks[runningIndex].running = true;

  return (
    <main className="relative flex flex-1 justify-center overflow-hidden px-4 pb-32 pt-6 md:pb-48 md:pt-14">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/maps/canopy-band.svg" alt="" className="pointer-events-none absolute bottom-0 left-0 hidden w-full opacity-90 md:block" />
      <section className="relative w-full max-w-[800px] rounded-[28px] border border-line bg-white p-5 shadow-soft md:p-9">
        <header className="flex items-center gap-4">
          <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-tint text-leaf md:h-[72px] md:w-[72px]">
            {report.cover?.kind === "foto" ? (
              // eslint-disable-next-line @next/next/no-img-element -- signed URL Supabase Storage
              <img src={report.cover.url} alt="" className="h-full w-full object-cover" />
            ) : report.cover?.kind === "video" ? (
              <video src={report.cover.url} muted playsInline preload="metadata" className="h-full w-full object-cover" aria-hidden="true" />
            ) : (
              <Icon name="camera" size={24} />
            )}
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-[-0.02em] md:text-[28px]">Status laporan</h1>
            <p className="mt-1 text-xs font-medium text-ink-2 md:text-[13px]">
              No. {report.code} · {report.summary} · dikirim {report.sentAt}
            </p>
          </div>
        </header>

        <ol className="mt-7 flex md:mt-9" aria-label="Tahap laporan">
          {[
            { state: "done" as const, title: "Terkirim", note: report.sentAt },
            {
              state: stopped ? ("warn" as const) : ("active" as const),
              title: needsFix ? "Perlu dilengkapi" : rejected ? "Tidak diterbitkan" : "Diperiksa AI",
              note: stopped ? "Pemeriksaan selesai" : "Kurang dari 1 menit",
            },
            { state: "todo" as const, title: "Tampil di peta", note: "Setelah lolos" },
          ].map((st, i, all) => (
            <Step key={st.title} {...st} last={i === all.length - 1} />
          ))}
        </ol>

        <div className="mt-6 rounded-[20px] bg-[#f7faf5] p-5 md:mt-8 md:p-6">
          <div className="flex items-center justify-between">
            <p className={`text-lg font-extrabold ${stopped ? "text-[#8a5a00]" : "text-ai-ink"}`} aria-live="polite">
              {needsFix ? (
                "Pemeriksaan butuh bantuanmu"
              ) : rejected ? (
                "Laporan tidak diterbitkan"
              ) : (
                <>
                  Sedang diperiksa
                  <span aria-hidden="true">
                    <span className="animate-dot-blink">.</span>
                    <span className="animate-dot-blink [animation-delay:0.2s]">.</span>
                    <span className="animate-dot-blink [animation-delay:0.4s]">.</span>
                  </span>
                </>
              )}
            </p>
            {!stopped && <span className="text-xs font-semibold text-ink-2">biasanya &lt; 1 menit</span>}
          </div>
          {!stopped && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ai-soft" role="progressbar" aria-label="Pemeriksaan berjalan">
              <span className="animate-progress-slide block h-full w-2/5 rounded-full bg-ai" />
            </div>
          )}
          <ul className="mt-3 space-y-2">
            {checks.map((c) => (
              <li
                key={c.text}
                className={`flex items-center gap-2.5 text-[15px] font-semibold transition-colors ${c.running ? "text-ai-ink" : !c.done && !c.warn ? "text-stale" : ""}`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                    c.done
                      ? "animate-badge-pop bg-leaf text-white"
                      : c.warn
                        ? "bg-pending text-white"
                        : c.running
                          ? "animate-spin border-[2.5px] border-ai-soft border-t-ai"
                          : "border-2 border-dashed border-line"
                  }`}
                  aria-hidden="true"
                >
                  {c.done && <Icon name="check" size={14} strokeWidth={3} />}
                  {c.warn && <span className="text-xs font-extrabold">!</span>}
                </span>
                {c.text}
                {c.running && "…"}
                <span className="sr-only">{c.done ? "(selesai)" : c.running ? "(sedang berjalan)" : c.warn ? "(perlu perhatian)" : "(menunggu)"}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className={`mt-5 flex gap-2.5 rounded-2xl p-4 text-sm font-semibold leading-relaxed ${stopped ? "bg-pending-soft text-[#6b4a00]" : "bg-ai-soft text-[#1f4e73]"}`}>
          <Icon name="info" size={19} className="shrink-0" />
          {needsFix
            ? "Ini bukan berarti pengamatanmu salah. Coba kirim laporan baru dengan foto yang lebih terang atau lebih dekat (dari tempat aman)."
            : rejected
              ? "Laporan ini tidak ditampilkan di peta. Jika menurutmu ada kekeliruan, hubungi tim WANA lewat halaman Kontak."
              : "Laporanmu belum tampil di peta sampai pemeriksaan selesai. Halaman ini diperbarui otomatis."}
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          {needsFix ? (
            <Link href="/lapor" className="btn-report px-6 py-3.5 text-base font-extrabold shadow-none hover:translate-y-0 active:translate-y-0">
              Kirim laporan baru
            </Link>
          ) : rejected ? (
            <Link href="/kontak" className="btn-outline px-6 py-3.5 text-[15px]">
              Hubungi tim WANA
            </Link>
          ) : null}
          <Link href="/laporan-saya" className="btn-outline px-6 py-3.5 text-[15px]">
            Semua laporan saya
          </Link>
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
          className={`absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-[13px] h-[2px] overflow-hidden rounded-full ${state === "done" ? "bg-leaf" : "bg-line"}`}
          aria-hidden="true"
        >
          {/* Garis menuju tahap berikutnya "mengalir" selama tahap ini berjalan. */}
          {state === "active" && <span className="animate-progress-slide block h-full w-2/5 rounded-full bg-leaf" />}
        </span>
      )}
      <span className={`grid h-7 w-7 place-items-center rounded-full ${circle} ${state === "active" ? "animate-pulse-ring-leaf" : ""}`}>
        {state === "done" && <Icon name="check" size={14} strokeWidth={3} />}
        {state === "active" && <span className="animate-breathe h-2.5 w-2.5 rounded-full bg-leaf" />}
        {state === "warn" && <span className="h-2.5 w-2.5 rounded-full bg-pending" />}
      </span>
      <span>
        <span className={`block text-[13px] md:text-sm ${titleColor}`}>{title}</span>
        <span className="block text-xs font-medium text-stale">{note}</span>
      </span>
    </li>
  );
}

function Published({ incident, code }: { incident: { id: string; title: string } | null; code: string }) {
  // Kejadian baru dari laporan ini ber-ID "wr-<nomor>"; selain itu laporan digabung ke kejadian yang ada.
  const isNew = incident?.id === "wr-" + code.slice(3).toLowerCase();
  return (
    <main className="flex flex-1 justify-center px-4 pb-32 pt-6 md:pt-10">
      <section className="relative flex w-full max-w-[680px] flex-col items-center overflow-hidden rounded-[32px] bg-white px-6 pb-8 pt-10 md:px-12 text-center shadow-soft">
        {/* Maskot */}
        <div className="relative animate-badge-pop">
          <Image src="/mascot/care.png" alt="Maskot orang utan WANA mengacungkan jempol" width={210} height={210} sizes="210px" className="relative z-10 h-[210px] w-[210px] object-contain" />
          <span className="absolute bottom-2 left-1/2 h-4 w-32 -translate-x-1/2 rounded-[50%] bg-forest/15 blur-[2px]" aria-hidden="true" />
        </div>

        <h1 className="relative mt-6 text-[28px] font-extrabold leading-tight tracking-[-0.02em]">
          Laporan lolos pemeriksaan, terima kasih!
        </h1>
        <p className="relative mt-2 max-w-[460px] text-[15px] md:text-base font-medium text-ink-2">
          {!incident
            ? "Pengamatanmu lolos pemeriksaan awal dan sedang ditampilkan di peta."
            : isNew
              ? `Pengamatanmu kini tampil di peta sebagai kejadian baru: "${incident.title}".`
              : `Pengamatanmu ditambahkan ke kejadian "${incident.title}" dan sudah tampil di peta.`}
        </p>

        <div className="relative mt-8 flex w-full items-center gap-3.5 rounded-[20px] bg-[#f3f5f1] p-4 text-left">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-leaf">
            <Icon name="share" size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-extrabold">Ajak warga sekitar ikut memantau</span>
            <span className="mt-0.5 block text-[13px] font-medium text-ink-2">Bagikan peta WANA supaya lebih banyak mata ikut mengamati.</span>
          </span>
        </div>

        <Link href={incident ? `/kejadian/${incident.id}` : "/pantau"} className="btn relative mt-5 w-full bg-forest py-4 text-base font-extrabold text-white hover:bg-forest-deep">
          {incident ? "Lihat kejadian" : "Lihat peta"}
        </Link>
        <Link href="/laporan-saya" className="relative mt-3 py-2 text-[15px] font-bold text-ink hover:text-leaf">
          Semua laporan saya
        </Link>
      </section>
    </main>
  );
}
