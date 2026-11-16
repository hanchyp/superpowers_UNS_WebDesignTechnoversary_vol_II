import type { Metadata } from "next";
import { Suspense } from "react";
import { AppBar } from "@/components/Chrome";
import { listIncidents } from "@/lib/incidentsDb";
import { PantauView } from "./PantauView";

export const metadata: Metadata = {
  title: "Pantau Wilayah",
  description: "Peta laporan indikasi asap dan api dari warga.",
};

export default function PantauPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[100svh] flex-col">
          <AppBar active="pantau" />
          <div className="grid flex-1 place-items-center bg-tint text-sm font-semibold text-ink-2">Memuat peta kejadian…</div>
        </div>
      }
    >
      <PantauWithData />
    </Suspense>
  );
}

async function PantauWithData() {
  const incidents = await listIncidents();
  return <PantauView header={<AppBar active="pantau" />} incidents={incidents} />;
}
