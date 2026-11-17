import type { Metadata } from "next";
import Image from "next/image";
import { AppBar, SiteFooter } from "@/components/Chrome";
import { RippleLink } from "@/components/RippleLink";

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

        <div className="relative overflow-hidden">
          {/* Daun samar di sudut */}
          <svg viewBox="0 0 100 140" className="pointer-events-none absolute -right-16 -top-10 h-72 w-52 rotate-[28deg] text-sprout/60 md:h-96 md:w-72" aria-hidden="true">
            <path d="M50 4C84 30 96 78 50 136C4 78 16 30 50 4Z" fill="currentColor" />
            <path d="M50 18V128M50 44L30 30M50 44L70 30M50 66L24 50M50 66L76 50M50 88L28 74M50 88L72 74" stroke="var(--color-tint)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>

          <div className="relative mx-auto max-w-[1200px] px-5 py-12 md:px-8 md:py-20">
            <section className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-extrabold tracking-tight md:text-4xl">Kenapa WANA dibuat?</h2>
                <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
                  Saat melihat asap atau api, warga punya informasi tentang lokasi dan waktu kejadian. WANA membantu mengumpulkan pengamatan itu di satu peta, sehingga warga lain bisa mengikuti perkembangan di wilayahnya dan menambahkan informasi tentang kejadian yang sama.
                </p>
                <RippleLink href="/pantau" fill="bg-forest" className="btn mt-7 bg-leaf px-6 py-3.5 text-white">Jelajahi peta</RippleLink>
              </div>

              {/* Maskot berpikir */}
              <div className="relative mx-auto w-full max-w-[340px]">
                <span className="absolute inset-x-[8%] bottom-[4%] top-[18%] rounded-full bg-sprout" aria-hidden="true" />
                {/* Gelembung pikiran */}
                <div className="absolute right-[2%] top-[2%] z-10" aria-hidden="true">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-3xl font-extrabold text-leaf shadow-soft">?</span>
                  <span className="absolute -bottom-3 left-1 h-4 w-4 rounded-full bg-white shadow-soft" />
                  <span className="absolute -bottom-6 -left-2 h-2.5 w-2.5 rounded-full bg-white shadow-soft" />
                </div>
                <Image
                  src="/mascot/thinking.png"
                  alt="Maskot orang utan WANA sedang berpikir"
                  width={420}
                  height={420}
                  sizes="(min-width: 768px) 340px, 280px"
                  className="relative mx-auto h-auto w-[86%]"
                />
              </div>
            </section>

          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
