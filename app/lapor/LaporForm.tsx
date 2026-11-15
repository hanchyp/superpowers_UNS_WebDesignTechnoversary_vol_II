"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Brand";
import { Icon, type IconName } from "@/components/Icon";
import { LiveMap } from "@/components/LiveMap";
import { getIncident, type Indication } from "@/lib/incidents";
import { useMediaQuery } from "@/lib/useMediaQuery";

type LngLat = [number, number];
const stepNames = ["Pengamatan", "Lokasi", "Tinjau"] as const;
const focus = getIncident("pulang-pisau")!;

export function LaporForm({ relatedId, relatedTitle }: { relatedId?: string; relatedTitle?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [indication, setIndication] = useState<Indication>("asap");
  const [timeMode, setTimeMode] = useState<"sekarang" | "pilih">("sekarang");
  const [locMode, setLocMode] = useState<"titik" | "arah">("titik");
  const [direction, setDirection] = useState("Timur laut");
  const [mergeChoice, setMergeChoice] = useState<"gabung" | "baru" | null>(relatedId ? "gabung" : null);
  const [agree, setAgree] = useState(true);
  const [time, setTime] = useState("13:50");
  const [note, setNote] = useState("Asap putih naik dari arah kanal di timur desa, sejak sekitar 13:50.");
  const [pin, setPin] = useState<LngLat>([focus.lon, focus.lat]);
  const isWide = useMediaQuery("(min-width: 768px)");

  const next = () => {
    if (step < 2) setStep(step + 1);
    else router.push("/laporan-saya/WR-1029");
  };

  return (
    <div className="flex h-[100svh] flex-col bg-paper">
      {/* Kepala */}
      <header className="border-b border-line bg-white">
        <div className="flex h-16 items-center gap-3 px-4 md:h-[72px] md:px-7">
          <Link href="/pantau" className="grid h-10 w-10 place-items-center rounded-full bg-tint md:hidden" aria-label="Batal">
            <Icon name="x" size={20} />
          </Link>
          <div className="hidden md:block">
            <Logo size="sm" />
          </div>
          <p className="flex-1 text-center text-[17px] font-extrabold md:text-left md:pl-6">
            {relatedId ? "Tambahkan pengamatan" : "Laporkan pengamatan"}
          </p>
          <span className="text-[13px] font-semibold text-ink-2">{step + 1}/3</span>
          <Link href="/pantau" className="hidden text-[15px] font-bold text-ink-2 hover:text-ink md:block">
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
                  time={time}
                  setTime={setTime}
                  indication={indication}
                  setIndication={setIndication}
                  timeMode={timeMode}
                  setTimeMode={setTimeMode}
                  note={note}
                  setNote={setNote}
                />
              )}
              {step === 1 && (
                <StepLocation locMode={locMode} setLocMode={setLocMode} direction={direction} setDirection={setDirection} pin={pin} onPinChange={setPin} showMap={!isWide} />
              )}
              {step === 2 && (
                <StepReview
                  time={timeMode === "sekarang" ? "14:32" : time}
                  indication={indication}
                  note={note}
                  locMode={locMode}
                  direction={direction}
                  mergeChoice={mergeChoice}
                  setMergeChoice={setMergeChoice}
                  agree={agree}
                  setAgree={setAgree}
                  related={Boolean(relatedId)}
                />
              )}
            </div>
            <footer className="flex gap-2.5 px-4 pb-6 pt-3 md:px-8 md:pb-5">
              {step > 0 && (
                <button type="button" onClick={() => setStep(step - 1)} className="btn-outline px-5 py-3.5 text-base">
                  Kembali
                </button>
              )}
              <button
                type="button"
                onClick={next}
                disabled={step === 2 && !agree}
                className={`btn-primary flex-1 py-3.5 text-base font-extrabold disabled:opacity-50`}
              >
                {step === 0 ? "Lanjut ke lokasi" : step === 1 ? "Lanjut ke tinjau" : "Kirim untuk diperiksa"}
              </button>
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
  indication: Indication;
  setIndication: (v: Indication) => void;
  timeMode: "sekarang" | "pilih";
  setTimeMode: (v: "sekarang" | "pilih") => void;
  note: string;
  setNote: (v: string) => void;
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
            <span className="text-[13px] font-semibold text-ink-2">14:32 WIB</span>
          ) : (
            <TimePicker value={props.time} onChange={props.setTime} />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionTitle>Foto atau video bukti</SectionTitle>
          <span className="text-xs font-semibold text-ink-2">2 dari 4</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="relative h-[104px] overflow-hidden md:h-[150px] rounded-2xl">
            <Image src="/photos/sebangau-rawa.jpg" alt="Foto 1 (simulasi)" fill sizes="200px" className="object-cover" />
            <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-leaf text-white">
              <Icon name="check" size={14} strokeWidth={3} />
            </span>
          </div>
          <div className="relative h-[104px] overflow-hidden md:h-[150px] rounded-2xl">
            <Image src="/photos/sebangau-peat-dome.jpg" alt="Foto 2 (simulasi), sedang diunggah" fill sizes="200px" className="object-cover" />
            <span className="absolute inset-0 bg-ink/45" />
            <span className="absolute inset-x-2.5 bottom-2.5">
              <span className="text-[11px] font-bold text-white">Mengunggah 60%</span>
              <span className="mt-1 block h-1.5 rounded-full bg-white/30">
                <span className="block h-full w-3/5 rounded-full bg-sun" />
              </span>
            </span>
          </div>
          <button type="button" className="flex h-[104px] md:h-[150px] flex-col items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-dashed border-leaf bg-tint text-xs font-bold text-leaf">
            <Icon name="camera" size={24} />
            Tambah foto/video
          </button>
        </div>
        <p className="flex items-center gap-2.5 rounded-2xl bg-sun-soft p-3 text-[13px] font-semibold text-[#6b4a00]">
          <Icon name="alert" size={20} className="shrink-0 text-pending" />
          Ambil foto atau video dari tempat aman. Jangan mendekati api atau asap tebal.
        </p>
      </div>

      <label className="block space-y-3">
        <SectionTitle>Ceritakan singkat</SectionTitle>
        <span className="relative block">
          <textarea
            value={props.note}
            onChange={(e) => props.setNote(limitWords(e.target.value, MAX_WORDS))}
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

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
        {value} WIB
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
}: {
  locMode: "titik" | "arah";
  setLocMode: (v: "titik" | "arah") => void;
  direction: string;
  setDirection: (v: string) => void;
  pin: LngLat;
  onPinChange: (v: LngLat) => void;
  showMap: boolean;
}) {
  const moved = Math.abs(pin[0] - focus.lon) > 0.05 || Math.abs(pin[1] - focus.lat) > 0.05;
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
          <p className="text-[15px] font-extrabold">{moved ? "Titik yang kamu pilih" : "Sekitar Pulang Pisau, Kalimantan Tengah"}</p>
          <p className="text-xs font-medium text-ink-2">{formatLngLat(pin)} · area ±1 km</p>
        </div>
        <button type="button" onClick={() => onPinChange([focus.lon, focus.lat])} className="text-sm font-bold text-leaf">
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

function formatLngLat([lon, lat]: LngLat) {
  return `${Math.abs(lat).toFixed(3)}° ${lat < 0 ? "LS" : "LU"} · ${Math.abs(lon).toFixed(3)}° ${lon < 0 ? "BB" : "BT"}`;
}

function StepReview(props: {
  time: string;
  direction: string;
  indication: Indication;
  note: string;
  locMode: "titik" | "arah";
  mergeChoice: "gabung" | "baru" | null;
  setMergeChoice: (v: "gabung" | "baru") => void;
  agree: boolean;
  setAgree: (v: boolean) => void;
  related: boolean;
}) {
  const rows = [
    ["Pengamatan", `${props.indication === "keduanya" ? "Asap dan api" : props.indication === "api" ? "Api" : "Asap"} · ${props.time} WIB`],
    ["Lokasi", props.locMode === "titik" ? "Titik perkiraan · ±1 km" : props.direction === "Tidak tahu" ? "Posisimu · arah tidak diketahui" : `Arah dari posisimu · ${props.direction.toLowerCase()}`],
  ];
  return (
    <>
      {!props.related && (
        <div className="rounded-[18px] border-[1.5px] border-leaf bg-tint p-4">
          <p className="text-[15px] font-extrabold text-forest">Ada kejadian serupa 1,2 km dari titikmu</p>
          <p className="mt-1 text-[13px] font-medium text-ink-2">Indikasi asap dan api di sekitar Pulang Pisau · 12 mnt lalu</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => props.setMergeChoice("gabung")}
              className={`btn flex-1 py-2.5 text-[13px] ${props.mergeChoice === "gabung" ? "bg-leaf text-white" : "border border-leaf bg-white text-leaf hover:bg-tint"}`}
            >
              Tambahkan ke sini
            </button>
            <button
              type="button"
              onClick={() => props.setMergeChoice("baru")}
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
            {["/photos/sebangau-rawa.jpg", "/photos/sebangau-peat-dome.jpg"].map((src) => (
              <span key={src} className="relative h-12 w-12 overflow-hidden rounded-[10px]">
                <Image src={src} alt="" fill sizes="48px" className="object-cover" />
              </span>
            ))}
          </span>
        </div>
        <p className="text-sm font-medium leading-relaxed">“{props.note}”</p>
      </div>
      <label className="flex cursor-pointer gap-3 text-[13px] font-semibold leading-relaxed">
        <input type="checkbox" checked={props.agree} onChange={(e) => props.setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#1e8a4c]" />
        Saya setuju bukti ini dipakai sesuai Ketentuan WANA, dan foto diambil dari tempat aman.
      </label>
    </>
  );
}
