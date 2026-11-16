"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Logo } from "@/components/Brand";
import { Icon, type IconName } from "@/components/Icon";
import { LiveMap } from "@/components/LiveMap";
import { formatLngLat, nearestIncident as nearestToPoint, type LngLat } from "@/lib/geo";
import type { IncidentLite as Incident, Indication } from "@/lib/incidents";
import { checkVideo, compressImage, formatBytes, MAX_FILE_MB, MAX_FILES, MAX_VIDEO_SECONDS } from "@/lib/media";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { createReport } from "./actions";

/**
 * Bukti yang dipilih. Foto langsung dikompresi saat dipilih ("memproses" -> "siap"),
 * jadi yang diunggah adalah `blob` hasil kompresi, bukan file asli.
 */
type Evidence = {
  id: string;
  url: string;
  kind: "foto" | "video";
  state: "memproses" | "siap";
  blob?: Blob;
  mime?: string;
  originalSize: number;
};

const stepNames = ["Pengamatan", "Lokasi", "Tinjau"] as const;
/** Titik awal peta bila belum ada data kejadian (Palangka Raya). */
const fallbackOrigin: Incident = {
  id: "",
  title: "",
  place: "Palangka Raya",
  region: "Kalimantan Tengah",
  lon: 113.92,
  lat: -2.21,
  condition: "belum-diketahui",
  updatedAgo: "",
};
/** Foto asli boleh lebih besar karena akan dikompresi sebelum diunggah. */
const MAX_RAW_IMAGE_MB = 40;

export function LaporForm({ incidents, relatedId, relatedTitle }: { incidents: Incident[]; relatedId?: string; relatedTitle?: string }) {
  const router = useRouter();
  const now = useClock();
  const [step, setStep] = useState(0);
  const [indication, setIndication] = useState<Indication>("asap");
  const [timeMode, setTimeMode] = useState<"sekarang" | "pilih">("sekarang");
  const [locMode, setLocMode] = useState<"titik" | "arah">("titik");
  const [direction, setDirection] = useState("Tidak tahu");
  const [mergeChoice, setMergeChoice] = useState<"gabung" | "baru" | null>(relatedId ? "gabung" : null);
  const [agree, setAgree] = useState(false);
  const [time, setTime] = useState<string | null>(null);
  const [note, setNote] = useState("");
  // Peta mulai di kejadian terkait, atau di kejadian aktif terbaru.
  const origin =
    (relatedId && incidents.find((i) => i.id === relatedId)) ||
    incidents.find((i) => i.condition !== "selesai") ||
    fallbackOrigin;
  const [pin, setPin] = useState<LngLat>([origin.lon, origin.lat]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [sendError, setSendError] = useState("");
  const isWide = useMediaQuery("(min-width: 768px)");

  // Bebaskan URL pratinjau saat form ditutup.
  const evidenceRef = useRef(evidence);
  useEffect(() => {
    evidenceRef.current = evidence;
  }, [evidence]);
  useEffect(() => () => evidenceRef.current.forEach((e) => URL.revokeObjectURL(e.url)), []);

  const nearby = relatedId || locMode !== "titik" ? undefined : nearestToPoint(pin, incidents);
  const observedAt = timeMode === "sekarang" ? now?.time : time ?? now?.time;
  const tz = now?.tz ?? "";

  // Apa yang masih kurang di langkah ini (kosong = boleh lanjut).
  const missing =
    step === 0
      ? evidence.length === 0
        ? "Tambahkan minimal 1 foto atau video sebagai bukti."
        : evidence.some((e) => e.state !== "siap") ? "Tunggu sampai semua foto selesai diproses." : null
      : step === 2
        ? nearby && !mergeChoice
          ? "Pilih apakah laporan ditambahkan ke kejadian terdekat atau dibuat baru."
          : !agree ? "Centang persetujuan untuk mengirim laporan." : null
        : null;

  const submit = async () => {
    setSendError("");
    setSending("Menyimpan laporan…");
    try {
      // Waktu pengamatan: "sekarang", atau jam yang dipilih hari ini (kemarin bila jamnya belum lewat).
      const observed = new Date();
      if (timeMode === "pilih" && observedAt) {
        const [h, m] = observedAt.split(":").map(Number);
        observed.setHours(h, m, 0, 0);
        if (observed.getTime() > Date.now()) observed.setDate(observed.getDate() - 1);
      }
      const ready = evidence.filter((e) => e.state === "siap" && e.blob && e.mime);
      const result = await createReport({
        incidentId: relatedId ?? (nearby && mergeChoice === "gabung" ? nearby.incident.id : null),
        indication,
        observedAt: observed.toISOString(),
        locationMode: locMode,
        lon: pin[0],
        lat: pin[1],
        direction,
        note,
        consent: agree,
        media: ready.map((e) => ({ kind: e.kind, mime: e.mime!, size: e.blob!.size })),
      });
      if (!result.ok) throw new Error(result.message);

      const storage = supabaseBrowser().storage.from("report-media");
      for (const [n, up] of result.uploads.entries()) {
        setSending(`Mengunggah bukti ${n + 1} dari ${result.uploads.length}…`);
        const e = ready[up.index];
        const { error } = await storage.uploadToSignedUrl(up.path, up.token, e.blob!, { contentType: e.mime });
        if (error) throw new Error(`Bukti ${n + 1} gagal diunggah. Laporan ${result.code} sudah tersimpan; coba kirim ulang buktinya nanti.`);
      }

      setSending("Membuka status laporan…");
      router.push(`/laporan-saya/${result.code}`);
    } catch (err) {
      setSending(null);
      setSendError(err instanceof Error ? err.message : "Laporan belum terkirim. Periksa koneksi lalu coba lagi.");
    }
  };

  const next = () => {
    if (sending) return;
    if (missing) {
      setTried(true);
      return;
    }
    setTried(false);
    if (step < 2) setStep(step + 1);
    else void submit();
  };

  const back = () => {
    setTried(false);
    setStep(step - 1);
  };

  return (
    <div className="flex h-[100svh] flex-col bg-paper">
      {/* Kepala */}
      <header className="border-b border-line bg-white">
        <div className="flex h-16 items-center gap-3 px-4 md:h-[72px] md:px-7">
          <Link href="/" className="grid h-10 w-10 place-items-center rounded-full bg-tint md:hidden" aria-label="Batal">
            <Icon name="x" size={20} />
          </Link>
          <div className="hidden md:block">
            <Logo size="sm" />
          </div>
          <p className="flex-1 text-center text-[17px] font-extrabold md:text-left md:pl-6">
            {relatedId ? "Tambahkan pengamatan" : "Laporkan pengamatan"}
          </p>
          <span className="text-[13px] font-semibold text-ink-2">{step + 1}/3</span>
          <Link href="/" className="hidden text-[15px] font-bold text-ink-2 hover:text-ink md:block">
            Batal
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className={`flex min-h-0 w-full flex-col ${step === 1 ? "md:w-[560px] md:border-r md:border-line md:bg-white" : ""}`}>
          <div className={`flex min-h-0 flex-1 flex-col ${step === 1 ? "" : "md:mx-auto md:w-full md:max-w-[1040px] md:px-4 lg:px-8"}`}>
            <Stepper step={step} />
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pb-6 pt-1 md:px-8">
              {relatedTitle && (
                <p className="rounded-2xl bg-tint p-3.5 text-sm font-semibold text-forest">
                  Kamu menambahkan pengamatan untuk: <strong>{relatedTitle}</strong>
                </p>
              )}
              {step === 0 && (
                <StepObservation
                  time={time ?? now?.time ?? "12:00"}
                  setTime={setTime}
                  nowLabel={now ? `${now.time}${tz && ` ${tz}`}` : ""}
                  tz={tz}
                  indication={indication}
                  setIndication={setIndication}
                  timeMode={timeMode}
                  setTimeMode={setTimeMode}
                  note={note}
                  setNote={setNote}
                  evidence={evidence}
                  setEvidence={setEvidence}
                />
              )}
              {step === 1 && (
                <StepLocation locMode={locMode} setLocMode={setLocMode} direction={direction} setDirection={setDirection} pin={pin} onPinChange={setPin} showMap={!isWide} origin={origin} />
              )}
              {step === 2 && (
                <StepReview
                  time={`${observedAt ?? "-"}${tz && ` ${tz}`}${timeMode === "pilih" && time && now && time > now.time ? " (kemarin)" : ""}`}
                  indication={indication}
                  note={note}
                  locMode={locMode}
                  direction={direction}
                  pin={pin}
                  nearby={nearby}
                  mergeChoice={mergeChoice}
                  setMergeChoice={setMergeChoice}
                  agree={agree}
                  setAgree={setAgree}
                  evidence={evidence}
                />
              )}
            </div>
            <footer className="px-4 pb-6 pt-3 md:px-8 md:pb-5">
              {((tried && missing) || sendError) && (
                <p role="alert" className="mb-2.5 flex items-center gap-2 text-[13px] font-bold text-fire-ink">
                  <Icon name="alert" size={16} className="shrink-0" />
                  {sendError || missing}
                </p>
              )}
              <div className="flex gap-2.5">
                {step > 0 && (
                  <button type="button" onClick={back} disabled={Boolean(sending)} className="btn-outline px-5 py-3.5 text-base disabled:opacity-50">
                    Kembali
                  </button>
                )}
                <button
                  type="button"
                  onClick={next}
                  aria-disabled={Boolean(missing || sending)}
                  aria-busy={Boolean(sending)}
                  className={`btn-primary flex-1 py-3.5 text-base font-extrabold ${missing || sending ? "opacity-60" : ""}`}
                >
                  {sending ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                      {sending}
                    </span>
                  ) : step === 0 ? "Lanjut ke lokasi" : step === 1 ? "Lanjut ke tinjau" : "Kirim untuk diperiksa"}
                </button>
              </div>
            </footer>
          </div>
        </div>
        {step === 1 && isWide && (
          <div className="relative flex-1">
            <LocationPicker big pin={pin} onPinChange={setPin} />
          </div>
        )}
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="px-5 pb-3 pt-4 md:px-8 md:pb-4 md:pt-6">
      <ol className="flex rounded-[20px] border border-line bg-white px-2 py-4 md:px-4" aria-label="Langkah">
        {stepNames.map((name, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={name} className="relative flex flex-1 flex-col items-center gap-2" aria-current={active ? "step" : undefined}>
              {i < stepNames.length - 1 && (
                <span
                  className={`absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-[13px] h-[2px] rounded-full transition-colors duration-300 ${done ? "bg-leaf" : "bg-line"}`}
                  aria-hidden="true"
                />
              )}
              <span
                className={`grid h-7 w-7 place-items-center rounded-full transition-all duration-300 ${
                  done ? "bg-leaf text-white" : active ? "border-2 border-leaf bg-white" : "border-2 border-line bg-white"
                }`}
              >
                {done && <Icon name="check" size={14} strokeWidth={3} />}
                {active && <span className="h-2.5 w-2.5 rounded-full bg-leaf" />}
              </span>
              <span className={`text-xs md:text-[13px] ${active ? "font-bold text-ink" : done ? "font-semibold text-ink-2" : "font-medium text-stale"}`}>
                {name}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[19px] font-extrabold md:text-xl">{children}</h2>;
}

const options: { value: Indication; label: string; icon: IconName[]; glyph: string }[] = [
  { value: "asap", label: "Asap", icon: ["smoke"], glyph: "bg-smoke text-white" },
  { value: "api", label: "Api", icon: ["flame"], glyph: "bg-fire text-white" },
  { value: "keduanya", label: "Keduanya", icon: ["flame", "smoke"], glyph: "bg-fire-soft text-fire" },
];

function StepObservation(props: {
  time: string;
  setTime: (v: string) => void;
  nowLabel: string;
  tz: string;
  indication: Indication;
  setIndication: (v: Indication) => void;
  timeMode: "sekarang" | "pilih";
  setTimeMode: (v: "sekarang" | "pilih") => void;
  note: string;
  setNote: (v: string) => void;
  evidence: Evidence[];
  setEvidence: (fn: (prev: Evidence[]) => Evidence[]) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 rounded-2xl bg-fire-soft p-3.5">
        <Icon name="phone" size={18} className="shrink-0 text-fire" />
        <p className="flex-1 text-[13px] font-bold text-[#7e1f14]">Bahaya langsung? Hubungi 112 dulu. WANA bukan layanan darurat.</p>
      </div>
      <fieldset className="space-y-3">
        <legend className="mb-3"><SectionTitle>Apa yang kamu lihat?</SectionTitle></legend>
        <div className="grid grid-cols-3 gap-2.5">
          {options.map((o) => {
            const on = props.indication === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => props.setIndication(o.value)}
                aria-pressed={on}
                className={`flex flex-col items-center gap-2 rounded-[18px] px-2 pb-3 pt-3.5 transition ${on ? "border-2 border-leaf bg-tint" : "border-[1.5px] border-line bg-white hover:bg-tint/60"}`}
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-full ${o.glyph}`}>
                  {o.icon.map((n) => (
                    <Icon key={n} name={n} size={o.icon.length > 1 ? 19 : 24} />
                  ))}
                </span>
                <span className="text-[15px] font-extrabold">{o.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-3">
        <SectionTitle>Kapan?</SectionTitle>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-full bg-line p-[3px]" role="radiogroup" aria-label="Waktu pengamatan">
            {(["sekarang", "pilih"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={props.timeMode === m}
                onClick={() => props.setTimeMode(m)}
                className={`rounded-full px-4 py-2 text-sm transition ${props.timeMode === m ? "bg-leaf font-bold text-white shadow-sm" : "font-semibold text-ink hover:text-leaf"}`}
              >
                {m === "sekarang" ? "Sekarang" : "Pilih waktu"}
              </button>
            ))}
          </div>
          {props.timeMode === "sekarang" ? (
            <span className="text-[13px] font-semibold text-ink-2">{props.nowLabel}</span>
          ) : (
            <TimePicker value={props.time} onChange={props.setTime} tz={props.tz} />
          )}
        </div>
      </div>

      <EvidencePicker evidence={props.evidence} setEvidence={props.setEvidence} />

      <label className="block space-y-3">
        <SectionTitle>Ceritakan singkat <span className="text-sm font-semibold text-ink-2">(opsional)</span></SectionTitle>
        <span className="relative block">
          <textarea
            value={props.note}
            onChange={(e) => props.setNote(limitWords(e.target.value, MAX_WORDS))}
            placeholder="Contoh: Asap putih naik dari arah kanal di timur desa, sejak sekitar pukul 13.50."
            rows={4}
            className="block w-full resize-none rounded-2xl border-[1.5px] border-control bg-white p-3.5 pb-8 text-[15px] font-medium leading-relaxed outline-none focus:border-leaf"
          />
          <span
            className={`pointer-events-none absolute bottom-2.5 right-3.5 text-xs font-semibold ${countWords(props.note) >= MAX_WORDS ? "text-fire" : "text-stale"}`}
            aria-live="polite"
          >
            {countWords(props.note)}/{MAX_WORDS} kata
          </span>
        </span>
      </label>
    </>
  );
}

function EvidencePicker({ evidence, setEvidence }: {
  evidence: Evidence[];
  setEvidence: (fn: (prev: Evidence[]) => Evidence[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const full = evidence.length >= MAX_FILES;

  const update = (id: string, patch: Partial<Evidence>) =>
    setEvidence((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const drop = (id: string) =>
    setEvidence((prev) => {
      const gone = prev.find((e) => e.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return prev.filter((e) => e.id !== id);
    });

  const add = (files: FileList | null) => {
    if (!files?.length) return;
    const picked = Array.from(files);
    const room = MAX_FILES - evidence.length;
    const supported = picked.filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
    const accepted = supported.slice(0, room);
    setError(
      supported.length < picked.length
        ? "Hanya foto atau video yang bisa dilampirkan."
        : accepted.length < supported.length ? `Maksimal ${MAX_FILES} berkas. Sisanya tidak ditambahkan.` : "",
    );

    for (const file of accepted) {
      const id = crypto.randomUUID();
      const kind = file.type.startsWith("video/") ? ("video" as const) : ("foto" as const);
      setEvidence((prev) => [...prev, { id, kind, url: URL.createObjectURL(file), state: "memproses", originalSize: file.size }]);

      // Proses di latar: foto dikompresi (dan EXIF dibuang), video diperiksa durasi/ukurannya.
      void (async () => {
        try {
          if (kind === "foto") {
            if (file.size > MAX_RAW_IMAGE_MB * 1024 * 1024) throw new Error(`Foto maksimal ${MAX_RAW_IMAGE_MB} MB.`);
            const blob = await compressImage(file);
            const url = URL.createObjectURL(blob);
            setEvidence((prev) =>
              prev.map((e) => {
                if (e.id !== id) return e;
                URL.revokeObjectURL(e.url);
                return { ...e, url, blob, mime: blob.type, state: "siap" };
              }),
            );
          } else {
            await checkVideo(file);
            update(id, { blob: file, mime: file.type, state: "siap" });
          }
        } catch (err) {
          drop(id);
          setError(err instanceof Error ? err.message : "Berkas tidak bisa diproses.");
        }
      })();
    }
  };

  const tile = "relative h-[104px] overflow-hidden rounded-2xl md:h-[150px]";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionTitle>Foto atau video bukti</SectionTitle>
        <span className="text-xs font-semibold text-ink-2">{evidence.length} dari {MAX_FILES}</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5 md:grid-cols-4">
        {evidence.map((e, i) => (
          <div key={e.id} className={`${tile} bg-ink`}>
            {e.kind === "video" ? (
              <video src={e.url} muted playsInline preload="metadata" className="h-full w-full object-cover" aria-label={`Video ${i + 1}`} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- pratinjau lokal (blob URL)
              <img src={e.url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
            )}
            {e.state === "memproses" ? (
              <span className="absolute inset-0 grid place-items-center bg-ink/55 text-[11px] font-bold text-white">
                <span className="flex flex-col items-center gap-1.5">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                  {e.kind === "foto" ? "Mengompres…" : "Memeriksa…"}
                </span>
              </span>
            ) : (
              <span className="absolute bottom-2 left-2 rounded-full bg-ink/70 px-2 py-0.5 text-[11px] font-bold text-white">
                {e.kind === "video" ? "Video · " : ""}
                {formatBytes(e.blob?.size ?? e.originalSize)}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setError("");
                drop(e.id);
              }}
              aria-label={`Hapus ${e.kind} ${i + 1}`}
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-ink/70 text-white hover:bg-ink"
            >
              <Icon name="x" size={14} strokeWidth={3} />
            </button>
          </div>
        ))}
        {!full && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className={`${tile} flex flex-col items-center justify-center gap-1.5 border-[1.5px] border-dashed border-leaf bg-tint text-xs font-bold text-leaf hover:bg-sprout/60`}
          >
            <Icon name="camera" size={24} />
            Tambah foto/video
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*,video/mp4,video/quicktime,video/webm"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />
      {error && <p role="alert" className="text-[13px] font-bold text-fire-ink">{error}</p>}
      <p className="text-xs font-medium text-ink-2">
        Foto dikecilkan otomatis dan data lokasi di dalam foto (EXIF/GPS) dibuang sebelum dikirim. Video maks. {MAX_VIDEO_SECONDS} detik, {MAX_FILE_MB} MB.
      </p>
      <p className="flex items-center gap-2.5 rounded-2xl bg-sun-soft p-3 text-[13px] font-semibold text-[#6b4a00]">
        <Icon name="alert" size={20} className="shrink-0 text-pending" />
        Ambil foto atau video dari tempat aman. Jangan mendekati api atau asap tebal.
      </p>
    </div>
  );
}

/** Jam lokal perangkat, diperbarui tiap 20 detik. null saat render di server. */
function useClock() {
  const value = useSyncExternalStore(
    (onChange) => {
      const t = setInterval(onChange, 20_000);
      return () => clearInterval(t);
    },
    () => {
      const d = new Date();
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}|${tzLabel(d)}`;
    },
    () => null,
  );
  if (!value) return null;
  const [time, tz] = value.split("|");
  return { time, tz };
}

function tzLabel(d: Date) {
  const offset = -d.getTimezoneOffset() / 60;
  return offset === 7 ? "WIB" : offset === 8 ? "WITA" : offset === 9 ? "WIT" : "";
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function TimePicker({ value, onChange, tz }: { value: string; onChange: (v: string) => void; tz: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [h, m] = value.split(":");

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    // Gulir kolom supaya jam/menit terpilih ada di tengah
    rootRef.current?.querySelectorAll<HTMLElement>("[data-selected=true]").forEach((el) => {
      const col = el.parentElement!;
      col.scrollTop = el.offsetTop - col.clientHeight / 2 + el.clientHeight / 2;
    });
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const column = (items: string[], current: string, pick: (v: string) => void, label: string) => (
    <div className="relative h-56 w-16 overflow-y-auto overscroll-contain py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="listbox" aria-label={label}>
      {items.map((v) => {
        const on = v === current;
        return (
          <button
            key={v}
            type="button"
            role="option"
            aria-selected={on}
            data-selected={on}
            onClick={() => pick(v)}
            className={`mx-auto my-0.5 block h-9 w-12 rounded-xl text-[15px] transition ${on ? "bg-leaf font-extrabold text-white" : "font-semibold text-ink hover:bg-tint hover:text-leaf"}`}
          >
            {v}
          </button>
        );
      })}
    </div>
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-full border-[1.5px] bg-white px-4 py-2 text-sm font-bold transition ${open ? "border-leaf text-leaf" : "border-line text-ink hover:border-leaf"}`}
      >
        {value}{tz && ` ${tz}`}
        <Icon name="chevronRight" size={16} className={`transition-transform ${open ? "-rotate-90" : "rotate-90"}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 rounded-[20px] border border-line bg-white p-2 shadow-[0_12px_32px_-12px_rgb(19_38_27/0.25)]">
          <div className="flex items-center px-1 pb-1 pt-0.5 text-[11px] font-bold uppercase tracking-wide text-stale">
            <span className="w-16 text-center">Jam</span>
            <span className="w-3" />
            <span className="w-16 text-center">Menit</span>
          </div>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 rounded-t-xl bg-gradient-to-b from-white to-transparent" />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 rounded-b-xl bg-gradient-to-t from-white to-transparent" />
            {column(HOURS, h, (v) => onChange(`${v}:${m}`), "Jam")}
            <span className="w-3 text-center text-lg font-extrabold text-stale">:</span>
            {column(MINUTES, m, (v) => onChange(`${h}:${v}`), "Menit")}
          </div>
          <button type="button" onClick={() => setOpen(false)} className="btn-primary mt-2 w-full py-2 text-sm font-bold">
            Selesai
          </button>
        </div>
      )}
    </div>
  );
}

const MAX_WORDS = 500;

function countWords(text: string) {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

function limitWords(text: string, max: number) {
  if (countWords(text) <= max) return text;
  const parts = text.split(/(\s+)/);
  let n = 0;
  let out = "";
  for (const part of parts) {
    if (part.trim()) {
      if (n === max) break;
      n++;
    }
    out += part;
  }
  return out.trimEnd();
}

function StepLocation({
  locMode,
  setLocMode,
  direction,
  setDirection,
  pin,
  onPinChange,
  showMap,
  origin,
}: {
  locMode: "titik" | "arah";
  setLocMode: (v: "titik" | "arah") => void;
  direction: string;
  setDirection: (v: string) => void;
  pin: LngLat;
  onPinChange: (v: LngLat) => void;
  showMap: boolean;
  origin: Incident;
}) {
  const moved = Math.abs(pin[0] - origin.lon) > 0.05 || Math.abs(pin[1] - origin.lat) > 0.05;
  const modes = [
    { value: "titik" as const, title: "Saya tahu perkiraan titik sumber", hint: "Taruh titik atau atur area di peta" },
    { value: "arah" as const, title: "Saya hanya tahu posisi saya dan arahnya", hint: "Pilih arah asap dan perkiraan jarak, atau “tidak tahu”" },
  ];
  return (
    <>
      <p className="hidden items-center gap-2.5 rounded-2xl bg-fire-soft px-3.5 py-2.5 text-[13px] font-bold text-[#7e1f14] md:flex">
        <Icon name="phone" size={17} className="text-fire" />
        Bahaya langsung? Hubungi 112 dulu. WANA bukan layanan darurat.
      </p>
      <fieldset>
        <legend className="mb-3"><SectionTitle>Seberapa tahu kamu lokasi sumbernya?</SectionTitle></legend>
        <div className="space-y-2.5">
          {modes.map((m) => {
            const on = locMode === m.value;
            return (
              <label key={m.value} className={`flex cursor-pointer items-center gap-3.5 rounded-[18px] p-4 ${on ? "border-2 border-leaf bg-tint" : "border-[1.5px] border-line bg-white"}`}>
                <input type="radio" name="lokasi" checked={on} onChange={() => setLocMode(m.value)} className="h-5 w-5 accent-[#1e8a4c]" />
                <span>
                  <span className="block text-[15px] font-extrabold md:text-base">{m.title}</span>
                  <span className="block text-[13px] font-medium text-ink-2 md:text-sm">{m.hint}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      {locMode === "arah" && (
        <div className="rounded-[18px] border border-line bg-white p-4">
          <p className="text-sm font-extrabold">Arah asap dari posisimu</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {["Utara", "Timur laut", "Timur", "Tenggara", "Selatan", "Barat daya", "Barat", "Barat laut", "Tidak tahu"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDirection(d)}
                aria-pressed={direction === d}
                className={direction === d ? "chip-active justify-center px-2 text-xs" : "chip justify-center px-2 text-xs"}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
      {showMap && (
        <div className="h-[290px] overflow-hidden rounded-[20px]">
          <LocationPicker pin={pin} onPinChange={onPinChange} />
        </div>
      )}
      <div className="flex items-center gap-3 rounded-[18px] border border-line bg-white p-4">
        <Icon name="pin" size={22} className="shrink-0 text-leaf" />
        <div className="flex-1">
          <p className="text-[15px] font-extrabold">{moved ? "Titik yang kamu pilih" : `Sekitar ${origin.place}, ${origin.region}`}</p>
          <p className="text-xs font-medium text-ink-2">{formatLngLat(pin)} · area ±1 km</p>
        </div>
        <button type="button" onClick={() => onPinChange([origin.lon, origin.lat])} className="text-sm font-bold text-leaf">
          Reset
        </button>
      </div>
      <p className="text-[13px] font-semibold leading-relaxed text-ink-2 md:text-sm">
        Lokasi perangkatmu tidak otomatis dianggap lokasi api. Titik ini ditandai sebagai perkiraan pelapor, bukan hasil validasi sistem.
      </p>
    </>
  );
}

function LocationPicker({ big = false, pin, onPinChange }: { big?: boolean; pin: LngLat; onPinChange: (v: LngLat) => void }) {
  const r = big ? 100 : 60;
  return (
    <LiveMap
      center={pin}
      zoom={big ? 11 : 10.5}
      onCenterChange={onPinChange}
      controls={big ? "full" : "locate"}
      controlsClassName={big ? "absolute right-4 top-20" : "absolute bottom-4 right-4"}
      className="h-full w-full"
    >
      <span
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-dashed border-leaf bg-leaf/15"
        style={{ width: r * 2, height: r * 2 }}
        aria-hidden="true"
      />
      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full drop-shadow-[0_6px_6px_rgb(19_38_27/0.3)]"
        width={big ? 48 : 36}
        height={big ? 70 : 52}
        viewBox="0 0 48 70"
        aria-hidden="true"
      >
        <path d="M24 68C24 68 2 43 2 24A22 22 0 0 1 46 24C46 43 24 68 24 68Z" fill="#1e8a4c" stroke="#fff" strokeWidth="3.5" />
        <circle cx="24" cy="24" r="9" fill="#fff" />
      </svg>
      <span className={`pointer-events-none absolute left-1/2 top-4 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 font-bold ${big ? "bg-ink/90 text-sm text-white" : "bg-white/95 text-xs text-ink"}`}>
        {big && <Icon name="pin" size={16} />}
        {big ? "Geser peta untuk menaruh titik di tengah lingkaran" : "Geser peta untuk menaruh titik"}
      </span>
    </LiveMap>
  );
}


function StepReview(props: {
  time: string;
  direction: string;
  indication: Indication;
  note: string;
  locMode: "titik" | "arah";
  pin: LngLat;
  nearby?: { incident: Incident; km: number };
  mergeChoice: "gabung" | "baru" | null;
  setMergeChoice: (v: "gabung" | "baru") => void;
  agree: boolean;
  setAgree: (v: boolean) => void;
  evidence: Evidence[];
}) {
  const rows = [
    ["Pengamatan", `${props.indication === "keduanya" ? "Asap dan api" : props.indication === "api" ? "Api" : "Asap"} · ${props.time}`],
    [
      "Lokasi",
      props.locMode === "titik"
        ? `Titik perkiraan · ${formatLngLat(props.pin)}`
        : props.direction === "Tidak tahu"
          ? "Posisimu · arah tidak diketahui"
          : `Arah dari posisimu · ${props.direction.toLowerCase()}`,
    ],
  ];
  const { nearby } = props;
  return (
    <>
      {nearby && (
        <div className="rounded-[18px] border-[1.5px] border-leaf bg-tint p-4">
          <p className="text-[15px] font-extrabold text-forest">
            Ada kejadian serupa {nearby.km < 0.1 ? "di titikmu" : `${nearby.km.toFixed(1).replace(".", ",")} km dari titikmu`}
          </p>
          <p className="mt-1 text-[13px] font-medium text-ink-2">{nearby.incident.title} · {nearby.incident.updatedAgo}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => props.setMergeChoice("gabung")}
              aria-pressed={props.mergeChoice === "gabung"}
              className={`btn flex-1 py-2.5 text-[13px] ${props.mergeChoice === "gabung" ? "bg-leaf text-white" : "border border-leaf bg-white text-leaf hover:bg-tint"}`}
            >
              Tambahkan ke sini
            </button>
            <button
              type="button"
              onClick={() => props.setMergeChoice("baru")}
              aria-pressed={props.mergeChoice === "baru"}
              className={`btn flex-1 py-2.5 text-[13px] ${props.mergeChoice === "baru" ? "bg-leaf text-white" : "border border-leaf bg-white text-leaf hover:bg-tint"}`}
            >
              Tetap laporan baru
            </button>
          </div>
        </div>
      )}
      <SectionTitle>Tinjau laporanmu</SectionTitle>
      <div className="space-y-3 rounded-[18px] border border-line bg-white p-4">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 text-sm">
            <span className="font-semibold text-ink-2">{k}</span>
            <span className="text-right font-extrabold">{v}</span>
          </div>
        ))}
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-ink-2">Foto/video</span>
          <span className="flex gap-1.5">
            {props.evidence.map((e) =>
              e.kind === "video" ? (
                <video key={e.id} src={e.url} muted playsInline preload="metadata" className="h-12 w-12 rounded-[10px] bg-ink object-cover" aria-hidden="true" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- pratinjau lokal (blob URL)
                <img key={e.id} src={e.url} alt="" className="h-12 w-12 rounded-[10px] object-cover" />
              ),
            )}
          </span>
        </div>
        {props.note.trim() && <p className="text-sm font-medium leading-relaxed">“{props.note.trim()}”</p>}
      </div>
      <label className="flex cursor-pointer gap-3 text-[13px] font-semibold leading-relaxed">
        <input type="checkbox" checked={props.agree} onChange={(e) => props.setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#1e8a4c]" />
        Saya setuju bukti ini dipakai sesuai Ketentuan WANA, dan foto diambil dari tempat aman.
      </label>
    </>
  );
}
