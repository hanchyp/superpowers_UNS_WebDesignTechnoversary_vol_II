"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { AppBar, MobileTabBar } from "@/components/Chrome";
import { Icon } from "@/components/Icon";
import { INDONESIA_VIEW, LiveMap } from "@/components/LiveMap";
import { IncidentTags, IndicationGlyph } from "@/components/Status";
import { featuredId, incidents, type Incident } from "@/lib/incidents";
import { useIsDesktop } from "@/lib/useMediaQuery";

type StatusFilter = "semua" | "berlangsung" | "mereda" | "belum-diketahui" | "lama";

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "berlangsung", label: "Masih berlangsung" },
  { value: "mereda", label: "Mereda" },
  { value: "belum-diketahui", label: "Belum diketahui" },
  { value: "lama", label: "Info lama" },
];

function matchesFilter(i: Incident, f: StatusFilter) {
  if (f === "semua") return true;
  if (f === "lama") return i.stale;
  return !i.stale && i.condition === f;
}

export function PantauView() {
  const isDesktop = useIsDesktop();
  const [selectedId, setSelectedId] = useState<string | undefined>(featuredId);
  const [view, setView] = useState<"peta" | "daftar">("peta");
  const [filter, setFilter] = useState<StatusFilter>("semua");
  const shown = incidents.filter((i) => matchesFilter(i, filter));
  const selected = shown.find((i) => i.id === selectedId);

  return (
    <div className="flex h-[100svh] flex-col overflow-hidden">
      <AppBar active="pantau" />
      <div className="relative flex min-h-0 flex-1">
        {/* Panel kiri (desktop) */}
        <aside className="hidden w-[420px] shrink-0 flex-col border-r border-line bg-white lg:flex">
          <div className="space-y-3.5 px-5 pb-4 pt-5">
            <h1 className="text-[26px] font-extrabold tracking-[-0.02em]">Pantau Wilayah</h1>
            <StatusChips value={filter} onChange={setFilter} />
          </div>
          <p className="flex gap-2 px-5 pb-1 pt-3 text-[13px] font-medium leading-snug text-ink-2">
            <Icon name="info" size={16} className="mt-0.5 shrink-0" />
            Hanya laporan yang lolos pemeriksaan publikasi. Peta kosong bukan berarti aman.
          </p>
          <ul className="flex-1 space-y-2.5 overflow-y-auto px-3.5 pb-4 pt-3">
            {shown.length === 0 && <li className="px-2 py-6 text-center text-sm font-semibold text-ink-2">Tidak ada kejadian dengan status ini.</li>}
            {shown.map((i) => (
              <li key={i.id}>
                <IncidentRow incident={i} selected={i.id === selectedId} onSelect={setSelectedId} />
              </li>
            ))}
          </ul>
        </aside>

        {/* Peta */}
        <main className="relative min-w-0 flex-1 overflow-hidden bg-water">
          <LiveMap
            center={INDONESIA_VIEW.center}
            zoom={INDONESIA_VIEW.zoom}
            incidents={shown}
            selectedId={selected?.id}
            onSelect={setSelectedId}
            followSelected
            selectedZoom={isDesktop ? 6.5 : 7}
            padding={isDesktop ? { right: 380, bottom: 40 } : { top: 150, bottom: 330 }}
            controls={isDesktop ? "full" : "locate"}
            controlsClassName={isDesktop ? "absolute right-4 top-4" : "absolute right-4 top-[136px]"}
            className="h-full w-full"
          />
          {isDesktop && selected && <Popover incident={selected} onClose={() => setSelectedId(undefined)} />}
          <MobileOverlay selected={selected} filter={filter} onFilterChange={setFilter} />

          <Legend />

          <MobileSheet items={shown} view={view} onViewChange={setView} selected={selected} onSelect={setSelectedId} />
        </main>
      </div>
      <MobileTabBar active="pantau" />
    </div>
  );
}

function StatusChips({ value, onChange, compact = false }: { value: StatusFilter; onChange: (v: StatusFilter) => void; compact?: boolean }) {
  return (
    <div className={`flex gap-2 ${compact ? "" : "flex-wrap"}`} role="radiogroup" aria-label="Filter kondisi">
      {statusFilters.map((f) => {
        const on = value === f.value;
        const count = incidents.filter((i) => matchesFilter(i, f.value)).length;
        return (
          <button
            key={f.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(f.value)}
            className={`${on ? "chip-active" : `chip ${compact ? "border-transparent" : ""}`} shrink-0 ${compact ? "shadow-soft" : ""}`}
          >
            {f.label}
            <span className={`text-xs font-bold ${on ? "text-white/80" : "text-stale"}`}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

function IncidentRow({ incident, selected, onSelect }: { incident: Incident; selected: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(incident.id)}
      className={`flex w-full gap-3 rounded-[18px] p-3.5 text-left transition ${
        selected ? "border-2 border-leaf bg-tint" : "border border-line bg-white hover:bg-tint/60"
      } ${incident.stale ? "border-dashed opacity-80" : ""}`}
      aria-pressed={selected}
    >
      <IndicationGlyph incident={incident} />
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="text-base font-extrabold leading-snug">{incident.title}</span>
        <span className="text-xs font-semibold text-earth">
          {incident.region} · {incident.updatedAgo}
        </span>
        <IncidentTags incident={incident} showEvidence={false} />
      </span>
    </button>
  );
}

/** Kartu kejadian terpilih, ditempel di sisi kanan peta agar tidak keluar layar di lebar mana pun. */
function Popover({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  return (
    <div
      className="absolute bottom-14 right-4 z-30 w-[360px] rounded-[22px] border border-line bg-white p-5 shadow-float"
      role="dialog"
      aria-label={incident.title}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-earth">
          {incident.region} · {incident.updatedAgo}
        </p>
        <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-tint text-ink-2" aria-label="Tutup">
          <Icon name="x" size={16} />
        </button>
      </div>
      <h2 className="mt-2 text-[19px] font-extrabold leading-snug">{incident.title}</h2>
      <div className="mt-3">
        <IncidentTags incident={incident} showEvidence={false} />
      </div>
      <div className="mt-4 flex gap-2">
        <Link href={`/kejadian/${incident.id}`} className="btn-primary flex-1 py-3 text-sm">
          Lihat detail
          <Icon name="arrowRight" size={17} />
        </Link>
        <Link href={`/lapor?kejadian=${incident.id}`} className="btn-outline flex-1 py-3 text-sm">
          Tambah pengamatan
        </Link>
      </div>
    </div>
  );
}

function Legend() {
  const groups: { title: string; rows: { icon: React.ReactNode; label: string }[] }[] = [
    {
      title: "Jenis indikasi",
      rows: [
        {
          icon: (
            <span className="grid h-7 w-7 place-items-center rounded-full bg-fire text-white ring-2 ring-white">
              <Icon name="flame" size={14} />
            </span>
          ),
          label: "Api",
        },
        {
          icon: (
            <span className="grid h-7 w-7 place-items-center rounded-full bg-smoke text-white ring-2 ring-white">
              <Icon name="smoke" size={14} />
            </span>
          ),
          label: "Asap",
        },
      ],
    },
    {
      title: "Penanda",
      rows: [
        { icon: <span className="h-7 w-7 rounded-full border-[1.5px] border-dashed border-smoke bg-smoke/15" />, label: "Area perkiraan" },
        {
          icon: (
            <span className="grid h-7 w-7 place-items-center rounded-full border-[1.5px] border-dashed border-smoke bg-white text-smoke opacity-75">
              <Icon name="smoke" size={13} />
            </span>
          ),
          label: "Info lama",
        },
        {
          icon: <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-forest bg-white text-[11px] font-extrabold text-forest">12</span>,
          label: "Kumpulan kejadian",
        },
        {
          icon: <span className="grid h-5 min-w-5 place-items-center rounded-full bg-support px-1 text-[10px] font-extrabold text-white ring-2 ring-white">2</span>,
          label: "Pengamatan pendukung",
        },
      ],
    },
  ];
  return (
    <details className="group absolute bottom-4 left-4 hidden w-[300px] overflow-hidden rounded-[20px] bg-white shadow-soft lg:block" open>
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <Icon name="layers" size={18} className="text-leaf" />
        <span className="flex-1 text-[15px] font-extrabold">Legenda</span>
        <Icon name="chevronRight" size={18} className="text-ink-2 transition-transform group-open:rotate-90" />
      </summary>
      <div className="space-y-3.5 border-t border-line px-4 pb-4 pt-3">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="text-[11px] font-bold uppercase tracking-wide text-stale">{g.title}</p>
            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2.5">
              {g.rows.map((r) => (
                <li key={r.label} className="flex items-center gap-2 text-[13px] font-semibold leading-tight">
                  <span className="grid w-7 shrink-0 place-items-center">{r.icon}</span>
                  {r.label}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}

/** Kontrol yang mengambang di atas peta pada mobile. */
function MobileOverlay({ selected, filter, onFilterChange }: { selected?: Incident; filter: StatusFilter; onFilterChange: (v: StatusFilter) => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 lg:hidden">
      <div className="absolute inset-x-4 top-3 space-y-2.5 [&>*]:pointer-events-auto">
        <label className="flex h-[54px] items-center gap-2.5 rounded-full bg-white pl-[18px] pr-[18px] shadow-float">
          <Icon name="search" size={20} className="text-ink-2" />
          <input
            key={selected?.id}
            type="search"
            defaultValue={selected?.region ?? ""}
            placeholder="Cari wilayah"
            className="min-w-0 flex-1 bg-transparent text-base font-bold outline-none"
          />
        </label>
        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <StatusChips value={filter} onChange={onFilterChange} compact />
        </div>
      </div>
    </div>
  );
}

function MobileSheet({
  items,
  view,
  onViewChange,
  selected,
  onSelect,
}: {
  items: Incident[];
  view: "peta" | "daftar";
  onViewChange: (v: "peta" | "daftar") => void;
  selected?: Incident;
  onSelect: (id: string) => void;
}) {
  const expanded = view === "daftar";
  const sheetRef = useRef<HTMLElement>(null);
  const collapsedH = useRef(260);
  const drag = useRef<{ startY: number; startH: number; maxH: number } | null>(null);
  const [dragH, setDragH] = useState<number | null>(null);
  const dragged = useRef(false);

  // Ingat tinggi lembar saat tertutup, jadi batas bawah saat ditarik.
  useLayoutEffect(() => {
    if (!expanded && dragH === null && sheetRef.current) collapsedH.current = sheetRef.current.offsetHeight;
  });

  const onPointerDown = (e: React.PointerEvent) => {
    const el = sheetRef.current;
    if (!el) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragged.current = false;
    drag.current = { startY: e.clientY, startH: el.offsetHeight, maxH: (el.parentElement?.clientHeight ?? 700) * 0.72 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (Math.abs(e.clientY - d.startY) > 6) dragged.current = true;
    const h = Math.min(d.maxH, Math.max(collapsedH.current, d.startH - (e.clientY - d.startY)));
    setDragH(h);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const dy = e.clientY - d.startY;
    if (dy < -40) onViewChange("daftar");
    else if (dy > 40) onViewChange("peta");
    setDragH(null);
  };

  const showList = dragH !== null ? dragH > collapsedH.current + 80 : expanded;

  return (
    <section
      ref={sheetRef}
      className={`absolute inset-x-0 bottom-20 z-30 flex flex-col rounded-t-[28px] bg-white px-4 pb-4 shadow-[0_-6px_28px_rgb(19_38_27/0.18)] lg:hidden ${
        dragH === null ? "transition-[height] duration-300" : ""
      } ${expanded && dragH === null ? "h-[72%]" : ""}`}
      style={dragH !== null ? { height: dragH } : undefined}
      aria-label="Daftar kejadian"
    >
      <div
        className="-mx-4 cursor-grab touch-none select-none px-4 pb-1 pt-2.5 active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <button
          type="button"
          onClick={() => !dragged.current && onViewChange(expanded ? "peta" : "daftar")}
          className="mx-auto mb-3 block h-[5px] w-11 rounded-full bg-[#c9d6c3]"
          aria-label={expanded ? "Kecilkan daftar" : "Perbesar daftar"}
        />
        <h2 className="text-lg font-extrabold">{items.length} kejadian di Indonesia</h2>
      </div>
      {showList ? (
        <ul className="mt-3 flex-1 space-y-2.5 overflow-y-auto">
          {items.map((i) => (
            <li key={i.id}>
              <IncidentRow
                incident={i}
                selected={i.id === selected?.id}
                onSelect={(id) => {
                  onSelect(id);
                  onViewChange("peta");
                }}
              />
            </li>
          ))}
        </ul>
      ) : (
        selected && (
          <div className="mt-3 rounded-[20px] border-2 border-leaf bg-tint p-3.5">
            <div className="flex gap-3">
              <IndicationGlyph incident={selected} />
              <div className="min-w-0">
                <h3 className="text-base font-extrabold leading-snug">{selected.title}</h3>
                <p className="mt-1 text-xs font-semibold text-earth">
                  {selected.updatedAgo} · {selected.updatedAt}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <IncidentTags incident={selected} showEvidence={false} />
            </div>
            <div className="mt-3 flex gap-2">
              <Link href={`/kejadian/${selected.id}`} className="btn-primary flex-1 py-3 text-sm">
                Lihat detail
              </Link>
              <Link href={`/lapor?kejadian=${selected.id}`} className="btn-outline flex-1 py-3 text-sm">
                Tambah pengamatan
              </Link>
            </div>
          </div>
        )
      )}
    </section>
  );
}
