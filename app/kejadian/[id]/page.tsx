import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppBar } from "@/components/Chrome";
import { Icon } from "@/components/Icon";
import { LiveMap } from "@/components/LiveMap";
import { ShareButton } from "@/components/ShareButton";
import { Tag } from "@/components/Status";
import { conditionLabel, illustrationPhoto, type TimelineEntry } from "@/lib/incidents";
import { getIncidentById, getIncidentPhotos } from "@/lib/incidentsDb";

export async function generateMetadata({ params }: PageProps<"/kejadian/[id]">): Promise<Metadata> {
  const { id } = await params;
  const incident = await getIncidentById(id);
  if (!incident) return { title: "Kejadian tidak ditemukan" };
  return { title: incident.title, description: incident.summary.slice(0, 200) };
}

const dot: Record<TimelineEntry["kind"], string> = {
  pengamatan: "bg-leaf",
  dukungan: "border-[3px] border-leaf bg-white",
  ai: "border-[3px] border-leaf bg-sprout",
  pertama: "bg-forest",
};

const indicationText = { asap: "asap", api: "api", keduanya: "asap dan api" } as const;

function aiChecks(indication: keyof typeof indicationText, photoCount: number) {
  return [
    photoCount > 0
      ? `Kemungkinan ${indicationText[indication]} terlihat pada ${photoCount > 1 ? `${photoCount} foto` : "foto"} pelapor`
      : `Kemungkinan ${indicationText[indication]} terlihat pada bukti pelapor`,
    "Waktu pengamatan dan perkiraan lokasi masuk akal",
    "Tidak ditemukan unggahan ulang foto yang sama",
  ];
}

export default function KejadianPage({ params }: PageProps<"/kejadian/[id]">) {
  return (
    <>
      <AppBar active="pantau" />
      <Suspense fallback={<main className="mx-auto w-full max-w-[1312px] px-4 pt-10 text-sm font-semibold text-ink-2 md:px-8">Memuat kejadian…</main>}>
        <IncidentDetail params={params} />
      </Suspense>
    </>
  );
}

async function IncidentDetail({ params }: Pick<PageProps<"/kejadian/[id]">, "params">) {
  const { id } = await params;
  const incident = await getIncidentById(id);
  if (!incident) notFound();
  const photos = await getIncidentPhotos(incident.id);

  const conditionTone =
    incident.condition === "berlangsung" ? "fire" : incident.condition === "mereda" ? "smoke" : "neutral";

  return (
    <>
      <main className="mx-auto w-full max-w-[1312px] px-4 pb-32 pt-5 md:px-8 md:pb-24 md:pt-7">
        <Link href="/pantau" className="inline-flex items-center gap-1.5 text-[15px] font-bold text-leaf">
          <Icon name="chevronLeft" size={20} />
          Kembali ke peta
          <span className="hidden font-semibold text-ink-2 sm:inline">· {incident.region} · {incident.place}</span>
        </Link>

        <header className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[880px]">
            <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] md:text-[44px]">{incident.title}</h1>
            <p className="mt-3 text-[13px] font-medium text-ink-2 md:text-sm">
              Diamati pertama {incident.firstSeen} · diperbarui {incident.updatedAt} ({incident.updatedAgo})
            </p>
          </div>
          <ShareButton
            title={`${incident.title} · WANA`}
            text={`${incident.title} (${incident.place}, ${incident.region}). Pantau perkembangannya di WANA.`}
            className="btn-outline self-start px-4 py-2.5 text-[15px] md:self-auto"
          />
        </header>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
          <div className="flex min-w-0 flex-col gap-5">
            {/* Galeri */}
            {photos.length > 0 ? (
              <Gallery photos={photos} />
            ) : (
              <figure className="relative h-[260px] overflow-hidden rounded-3xl md:h-[400px]">
                <Image
                  src={illustrationPhoto[incident.indication]}
                  alt={`Ilustrasi ${incident.indication === "keduanya" ? "asap dan api" : incident.indication} di lahan gambut (dibuat AI, bukan foto kejadian ini)`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 860px, 100vw"
                  className="object-cover"
                />
              </figure>
            )}

            {/* Status (mobile di atas, desktop di samping) */}
            <StatusCard className="lg:hidden" />

            <section className="card p-5 md:p-7">
              <h2 className="text-xl font-extrabold md:text-[22px]">Ringkasan pengamatan</h2>
              <p className="mt-3 text-base font-medium leading-relaxed md:text-[17px]">{incident.summary}</p>
            </section>

            <section className="card p-5 md:p-7">
              <h2 className="text-xl font-extrabold md:text-[22px]">Hasil pemeriksaan awal AI</h2>
              <ul className="mt-4 space-y-3">
                {aiChecks(incident.indication, photos.length).map((c) => (
                  <li key={c} className="flex items-center gap-3 text-[15px] font-medium md:text-base">
                    <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-ai-soft text-ai-ink">
                      <Icon name="check" size={16} />
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex gap-3 rounded-2xl bg-earth-soft p-4 text-sm font-semibold leading-relaxed text-[#6b4a2e] md:text-[15px]">
                <Icon name="info" size={20} className="shrink-0 text-earth" />
                Keterbatasan: AI tidak dapat memastikan lokasi dari koordinat yang diketik pelapor, dan tidak menilai besar
                atau arah api. Hasil ini syarat tampil, bukan verifikasi.
              </p>
            </section>

            <section className="card p-5 md:p-7">
              <h2 className="text-xl font-extrabold md:text-[22px]">Linimasa pengamatan</h2>
              <ol className="mt-5">
                {incident.timeline.map((t, idx) => (
                  <li key={`${t.day ?? ""}${t.time}${t.title}${idx}`} className="flex gap-4">
                    <span className="w-12 shrink-0 pt-0.5 text-[13px] font-semibold leading-tight text-ink-2">
                      {t.day && <span className="block text-[11px] font-bold">{t.day}</span>}
                      {t.time}
                    </span>
                    <span className="flex flex-col items-center pt-1">
                      <span className={`h-4 w-4 shrink-0 rounded-full ${dot[t.kind]}`} />
                      {idx < incident.timeline.length - 1 && <span className="-my-0.5 w-[3px] flex-1 rounded-full bg-leaf" />}
                    </span>
                    <span className="pb-6">
                      <span className="block text-base font-extrabold">{t.title}</span>
                      <span className="mt-0.5 block text-[15px] font-medium text-ink-2">{t.note}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <aside className="flex flex-col gap-5">
            <section className="card hidden p-5 lg:block">
              <StatusBody />
            </section>
            <section className="card overflow-hidden">
              <LiveMap
                center={[incident.lon, incident.lat]}
                zoom={incident.precision === "area" ? 10 : 11}
                incidents={[incident]}
                selectedId={incident.id}
                area={incident.precision === "area" ? { lon: incident.lon, lat: incident.lat, radiusKm: incident.radiusKm } : undefined}
                cooperative
                controls="zoom"
                controlsClassName="absolute right-3 top-3"
                className="h-60 w-full"
              />
              <div className="p-5">
                <p className="text-base font-extrabold">
                  {incident.precision === "area" ? `Area perkiraan sumber · ±${incident.radiusKm.toLocaleString("id")} km` : "Titik perkiraan pelapor"}
                </p>
                <p className="mt-1 text-sm font-medium text-ink-2">Disusun dari pengamatan dan arah pandang warga. Bukan titik pasti.</p>
                <p className="mt-2 text-xs font-medium text-ink-2">
                  {Math.abs(incident.lat).toFixed(2)}° {incident.lat < 0 ? "LS" : "LU"} · {incident.lon.toFixed(2)}° BT
                </p>
              </div>
            </section>
            <section className="hidden rounded-3xl bg-forest p-6 text-white lg:block">
              <h2 className="text-[21px] font-extrabold">Melihat kejadian yang sama?</h2>
              <p className="mt-2 text-[15px] font-medium text-[#cfe8c6]">
                Tambahkan pengamatanmu agar informasinya lebih lengkap. Ambil foto dari tempat aman.
              </p>
              <Link href={`/lapor?kejadian=${incident.id}`} className="btn mt-4 w-full bg-sun py-3.5 font-extrabold text-forest">
                <Icon name="plus" size={20} />
                Tambahkan pengamatan
              </Link>
            </section>
            <p className="flex gap-3 rounded-[18px] bg-fire-soft p-4 text-sm font-bold text-[#7e1f14]">
              <Icon name="phone" size={20} className="shrink-0 text-fire" />
              Api dekat permukiman? Hubungi 112 lebih dulu. WANA bukan layanan darurat.
            </p>
          </aside>
        </div>
      </main>

      {/* Aksi menempel di mobile */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white px-4 pb-6 pt-3 shadow-[0_-4px_14px_rgb(19_38_27/0.08)] lg:hidden">
        <Link href={`/lapor?kejadian=${incident.id}`} className="btn-report w-full py-3.5 text-base font-extrabold">
          <Icon name="plus" size={20} />
          Tambahkan pengamatan
        </Link>
      </div>
    </>
  );

  function StatusBody() {
    return (
      <>
        <p className="text-sm font-extrabold text-ink-2">Kondisi terbaru</p>
        <div className="mt-2.5">
          <Tag kind={incident!.stale ? "stale" : conditionTone}>
            {incident!.stale ? `Belum diperbarui ${incident!.updatedAgo.replace(" lalu", "")}` : conditionLabel[incident!.condition]}
          </Tag>
        </div>
        <p className="mt-2.5 text-sm font-medium text-ink-2">
          {incident!.stale
            ? "Kondisi saat ini belum diketahui. Informasi lama bukan berarti sudah selesai."
            : `Menurut pengamatan warga ${incident!.updatedAt}.`}
        </p>
      </>
    );
  }

  function StatusCard({ className = "" }: { className?: string }) {
    return (
      <section className={`card p-5 ${className}`}>
        <StatusBody />
      </section>
    );
  }
}

/** Foto dari laporan warga yang sudah terbit (EXIF/GPS sudah dibuang saat dikirim). */
function Gallery({ photos }: { photos: string[] }) {
  const [main, ...rest] = photos;
  const side = rest.slice(0, 2);
  const more = photos.length - 1 - side.length;
  return (
    <div className={`grid h-[260px] gap-3 md:h-[400px] ${side.length ? "grid-cols-[1fr_auto]" : ""}`}>
      <div className="relative overflow-hidden rounded-3xl bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element -- signed URL Supabase Storage */}
        <img src={main} alt="Foto dari pelapor" className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-ink/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">Foto pelapor</span>
      </div>
      {side.length > 0 && (
        <div className={`grid w-[110px] gap-3 md:w-[270px] ${side.length > 1 ? "grid-rows-2" : ""}`}>
          {side.map((src, i) => (
            <div key={src} className="relative grid place-items-center overflow-hidden rounded-3xl bg-ink">
              {/* eslint-disable-next-line @next/next/no-img-element -- signed URL Supabase Storage */}
              <img src={src} alt={`Foto pengamatan ${i + 2}`} className="absolute inset-0 h-full w-full object-cover" />
              {i === side.length - 1 && more > 0 && (
                <>
                  <span className="absolute inset-0 bg-ink/50" />
                  <span className="relative text-lg font-extrabold text-white md:text-xl">+{more} foto</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
