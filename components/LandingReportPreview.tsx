"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Incident } from "@/lib/incidents";
import { Icon } from "./Icon";
import { LiveMap } from "./LiveMap";

const title = "Indikasi asap dari arah kanal";
const photo = "/photos/simulasi-karhutla-kanal.webp";
const photoAlt = "Asap dan api kecil di semak lahan gambut di seberang kanal";

export function LandingReportPreview({ incident, className }: { incident: Incident; className: string }) {
  const photoDialog = useRef<HTMLDialogElement>(null);
  const [pinOpen, setPinOpen] = useState(false);

  return (
    <article className={`${className} mt-8 grid gap-4 bg-tint p-4 md:mt-10 md:grid-cols-2 md:gap-x-8 md:p-7`}>
      <button
        type="button"
        aria-label="Perbesar foto simulasi"
        aria-haspopup="dialog"
        onClick={() => photoDialog.current?.showModal()}
        className="relative aspect-[16/10] w-full cursor-zoom-in overflow-hidden rounded-2xl border-2 border-forest"
      >
        <Image src={photo} alt={photoAlt} fill sizes="(min-width: 1200px) 550px, (min-width: 768px) 50vw, 100vw" className="object-cover" />
        <span aria-hidden="true" className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-white text-forest">
          <Icon name="plus" size={20} />
        </span>
      </button>

      <div className="min-w-0">
        <h3 className="text-xl font-extrabold md:text-2xl">{title}</h3>
        <p className="mt-1 text-sm font-medium text-ink-2">
          {incident.place}, {incident.region} · <time dateTime="2026-11-08T13:58:00+07:00">8 Nov 2026, 13.58 WIB</time>
        </p>
      </div>

      <div className="border-t border-forest/20 pt-3">
        <p className="text-sm font-extrabold text-forest">Menunggu verifikasi petugas</p>
        <p className="mt-1 text-sm text-ink-2">Lolos pemeriksaan AI</p>
      </div>

      <div className="min-w-0 md:col-start-2 md:row-span-3 md:row-start-1">
        <LiveMap
          center={[incident.lon, incident.lat]}
          zoom={9.5}
          incidents={[incident]}
          area={{ lon: incident.lon, lat: incident.lat, radiusKm: incident.radiusKm }}
          selectedId={pinOpen ? incident.id : undefined}
          onSelect={() => setPinOpen((open) => !open)}
          cooperative
          controls="zoom"
          controlsClassName="absolute right-3 top-3"
          className="h-64 w-full rounded-2xl border-2 border-forest md:h-full md:min-h-72"
        >
          {pinOpen && (
            <div role="status" className="pointer-events-none absolute inset-x-3 bottom-8 z-20 mx-auto w-fit max-w-[calc(100%-1.5rem)] rounded-xl bg-white px-4 py-2 text-center text-sm font-bold text-forest shadow-soft">
              {title}
            </div>
          )}
        </LiveMap>
      </div>

      <Link href="/pantau" className="btn justify-self-start bg-sun px-5 py-3 font-extrabold text-forest hover:bg-[#ffd666] md:col-start-2 md:row-start-4 md:justify-self-end">
        Buka peta WANA
        <Icon name="arrowRight" size={18} />
      </Link>

      <dialog ref={photoDialog} aria-label="Foto simulasi pengamatan" className="fixed inset-0 m-auto max-h-[90dvh] w-[min(92vw,960px)] max-w-none overflow-auto rounded-2xl bg-ink p-3 text-white backdrop:bg-black/80">
        <form method="dialog" className="mb-2 flex justify-end">
          <button autoFocus className="rounded-full bg-white px-4 py-2 text-sm font-bold text-forest">Tutup foto</button>
        </form>
        <div className="relative h-[min(70dvh,640px)]">
          <Image src={photo} alt={photoAlt} fill sizes="(min-width: 1044px) 936px, 92vw" className="object-contain" />
        </div>
      </dialog>
    </article>
  );
}
