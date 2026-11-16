import type { Metadata } from "next";
import { Suspense } from "react";
import { AppBar } from "@/components/Chrome";
import { listIncidents } from "@/lib/incidentsDb";
import { PantauView } from "./PantauView";

export const metadata: Metadata = {
  title: "Pantau Wilayah",
  description: "Peta laporan indikasi asap dan api dari warga.",
};

export default function PantauPage({ searchParams }: PageProps<"/pantau">) {
  return (
    <Suspense
      fallback={
        <div className="flex h-[100svh] flex-col">
          <AppBar active="pantau" />
          <div className="grid flex-1 place-items-center bg-tint text-sm font-semibold text-ink-2">Memuat peta kejadian…</div>
        </div>
      }
    >
      <PantauWithData searchParams={searchParams} />
    </Suspense>
  );
}

async function PantauWithData({ searchParams }: Pick<PageProps<"/pantau">, "searchParams">) {
  const [incidents, { q }] = await Promise.all([listIncidents(), searchParams]);
  const query = typeof q === "string" ? q.slice(0, 80) : "";
  // key: pencarian baru dari bar atas memulai ulang tampilan dengan kata kunci itu.
  return <PantauView key={query} header={<AppBar active="pantau" />} incidents={incidents} initialQuery={query} />;
}
