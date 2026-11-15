import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AppBar, SiteFooter } from "@/components/Chrome";
import { EdukasiBasics } from "@/components/EdukasiBasics";
import { Icon } from "@/components/Icon";
import { RegionalMap } from "@/components/Map";
import { incidents } from "@/lib/incidents";

export const metadata: Metadata = {
  title: "Edukasi Karhutla",
  description: "Kenali kebakaran hutan dan lahan, pahami titik panas, dan jelajahi contoh laporan di peta WANA.",
};

export default function EdukasiPage() {
  // Data simulasi diurutkan dari pembaruan paling baru di lib/incidents.ts.
  const recent = incidents.slice(0, 3);

  return (
    <>
      <AppBar active="edukasi" search={false} />
      <main>
        <header className="relative isolate overflow-hidden bg-forest-deep text-white">
          <Image src="/photos/rawa-gambut-udara.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover" />
          <div className="absolute inset-0 -z-10 bg-forest-deep/80" />
          <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
            <h1 className="max-w-[720px] text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-7xl">
              Mengenal kebakaran hutan dan lahan
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/90">
              Pelajari bagaimana karhutla menyebar, apa yang terjadi saat gambut terbakar, dan cara membaca titik panas.
            </p>
            <a href="#kejadian-terbaru" className="btn mt-7 bg-sun px-5 py-3 text-forest hover:bg-[#ffd666]">
              Lihat kejadian terbaru <Icon name="arrowRight" size={18} />
            </a>
          </div>
        </header>

        <section aria-labelledby="bacaan" className="bg-gradient-to-b from-paper via-tint to-paper">
          <EdukasiBasics />
        </section>

        <section id="kejadian-terbaru" aria-labelledby="judul-kejadian" className="scroll-mt-20 bg-tint py-14 md:py-20">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="judul-kejadian" className="text-3xl font-extrabold tracking-tight md:text-4xl">Kejadian terbaru</h2>
                <p className="mt-2 text-ink-2">Data simulasi untuk mencoba alur pemantauan di WANA.</p>
              </div>
              <Link href="/pantau" className="btn border border-forest bg-white px-5 py-3 text-forest hover:bg-sprout">
                Buka peta lengkap <Icon name="arrowRight" size={18} />
              </Link>
            </div>
            <ul className="mt-7 grid gap-4 md:grid-cols-3">
              {recent.map((incident) => (
                <li key={incident.id}>
                  <Link href={`/kejadian/${incident.id}`} className="group block h-full overflow-hidden rounded-3xl border border-line bg-white hover:border-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest">
                    <RegionalMap focus={incident} items={[incident]} showTowns={false} className="h-40 border-b border-line" />
                    <div className="p-5">
                      <p className="text-sm font-semibold text-ink-2">{incident.region} · {incident.updatedAgo}</p>
                      <h3 className="mt-2 text-lg font-extrabold leading-snug group-hover:underline">{incident.title}</h3>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
