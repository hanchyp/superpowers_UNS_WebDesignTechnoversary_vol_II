import type { Metadata } from "next";
import { Suspense } from "react";
import { listIncidents, toLite } from "@/lib/incidentsDb";
import { LaporForm } from "./LaporForm";

export const metadata: Metadata = { title: "Laporkan pengamatan" };

export default function LaporPage({ searchParams }: PageProps<"/lapor">) {
  return (
    <Suspense fallback={<div className="grid h-[100svh] place-items-center bg-paper text-sm font-semibold text-ink-2">Menyiapkan form…</div>}>
      <LaporWithContext searchParams={searchParams} />
    </Suspense>
  );
}

async function LaporWithContext({ searchParams }: Pick<PageProps<"/lapor">, "searchParams">) {
  const { kejadian } = await searchParams;
  // Kejadian dipakai untuk menawarkan penggabungan ke kejadian terdekat.
  const incidents = (await listIncidents()).map(toLite);
  const related = typeof kejadian === "string" ? incidents.find((i) => i.id === kejadian) : undefined;
  return <LaporForm incidents={incidents} relatedId={related?.id} relatedTitle={related?.title} />;
}
