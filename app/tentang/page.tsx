import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AppBar, SiteFooter } from "@/components/Chrome";

export const metadata: Metadata = {
  title: "Tentang WANA",
  description: "Kenali tujuan WANA dan bagaimana pengamatan warga membantu memantau kebakaran hutan dan lahan.",
};

export default function TentangPage() {
  return (
    <>
      <AppBar active="tentang" search={false} />
      <main className="bg-tint">
        <section className="relative isolate overflow-hidden bg-forest-deep text-white">
          <Image src="/photos/rawa-gambut-udara.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover" />
          <div className="absolute inset-0 -z-10 bg-forest-deep/80" />
          <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-8 md:py-24">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl">Tentang WANA</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">
              WANA adalah peta bersama untuk memantau indikasi kebakaran hutan dan lahan di Indonesia lewat pengamatan warga.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-5 py-12 md:px-8 md:py-16">
          <section className="max-w-2xl">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">Kenapa WANA dibuat?</h2>
            <p className="mt-3 leading-relaxed text-ink-2">
              Saat melihat asap atau api, warga punya informasi tentang lokasi dan waktu kejadian. WANA membantu mengumpulkan pengamatan itu di satu peta, sehingga warga lain bisa mengikuti perkembangan di wilayahnya dan menambahkan informasi tentang kejadian yang sama.
            </p>
            <Link href="/pantau" className="btn-primary mt-6 px-5 py-3">Jelajahi peta</Link>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
