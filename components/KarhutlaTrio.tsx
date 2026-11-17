"use client";

import Image from "next/image";
import { useState } from "react";

type Card = {
  title: string;
  short: string;
  body: string;
  photo: string;
  alt: string;
};

const cards: Card[] = [
  {
    title: "Apa itu karhutla?",
    short: "Karhutla",
    body: "Kebakaran hutan dan lahan bisa terjadi di kawasan berhutan maupun lahan terbuka. Sebagian besar dipicu aktivitas manusia, dan kemarau panjang membuat vegetasi kering mudah tersulut. Api lalu menjalar dan asapnya terbawa angin jauh dari lokasi.",
    photo: "/photos/ilustrasi/asap-dan-api.webp",
    alt: "Asap tebal dan api di lahan dekat kanal",
  },
  {
    title: "Mengapa gambut sulit dipadamkan?",
    short: "Gambut",
    body: "Gambut adalah tumpukan sisa tumbuhan selama ribuan tahun. Saat kering dan terbakar, bara merambat diam-diam di bawah permukaan, jadi api yang terlihat padam belum tentu benar-benar mati. Asap dari gambut juga paling pekat dan berbahaya.",
    photo: "/photos/sebangau-peat-dome.jpg",
    alt: "Rawa gambut Sebangau yang tergenang air",
  },
  {
    title: "Apa arti titik panas di peta?",
    short: "Titik panas",
    body: "Satelit menandai area yang suhunya melewati ambang tertentu sebagai titik panas. Ini petunjuk awal, belum tentu kebakaran, karena bisa juga berasal dari atap seng panas atau suar industri. Laporan warga dari lapangan membantu memastikannya.",
    photo: "/photos/rawa-gambut-udara.jpg",
    alt: "Hutan rawa gambut dilihat dari udara",
  },
];

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

export function KarhutlaTrio() {
  const [active, setActive] = useState(0);

  return (
    <section aria-labelledby="judul-karhutla" className="bg-paper py-14 md:py-24">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 id="judul-karhutla" className="text-3xl font-extrabold tracking-tight md:text-[44px] md:leading-[1.1]">
              Apa yang perlu kamu tahu tentang karhutla?
            </h2>
          </div>
          <p className="max-w-sm text-ink-2">Tiga hal dasar yang membantumu membaca situasi dan melapor dengan tepat.</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 md:mt-12 md:h-[540px] md:flex-row" role="tablist" aria-label="Materi karhutla">
          {cards.map((card, i) => {
            const on = i === active;
            return (
              <div
                key={card.title}
                role="tab"
                tabIndex={0}
                aria-selected={on}
                aria-label={card.title}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`group relative cursor-pointer overflow-hidden rounded-[28px] bg-forest-deep outline-none transition-all duration-700 ${EASE} focus-visible:ring-4 focus-visible:ring-sun ${
                  on ? "h-[460px] md:h-auto md:flex-[3.2]" : "h-[84px] md:h-auto md:flex-1"
                }`}
              >
                <Image
                  src={card.photo}
                  alt={card.alt}
                  fill
                  sizes="(min-width: 768px) 700px, 100vw"
                  className={`object-cover transition-transform duration-[1200ms] ${EASE} ${on ? "scale-100" : "scale-110"}`}
                />
                <div
                  className={`absolute inset-0 transition-colors duration-700 ${
                    on ? "bg-gradient-to-t from-forest-deep via-forest-deep/55 to-forest-deep/5" : "bg-forest-deep/65 group-hover:bg-forest-deep/55"
                  }`}
                />

                {/* Label saat tertutup */}
                <div
                  className={`absolute inset-0 flex items-center gap-4 px-6 text-white transition-opacity duration-300 md:flex-col md:items-start md:justify-between md:py-7 ${
                    on ? "pointer-events-none opacity-0" : "opacity-100 delay-200"
                  }`}
                  aria-hidden={on}
                >
                  <span className="text-sm font-extrabold text-sun">0{i + 1}</span>
                  <span className="text-lg font-extrabold md:origin-bottom-left md:-rotate-90 md:translate-x-[1.1rem] md:whitespace-nowrap md:text-xl">
                    {card.short}
                  </span>
                </div>

                {/* Isi saat terbuka */}
                <div
                  className={`absolute inset-x-0 bottom-0 p-6 text-white transition-all duration-500 md:p-9 ${
                    on ? "translate-y-0 opacity-100 delay-300" : "pointer-events-none translate-y-6 opacity-0"
                  }`}
                  aria-hidden={!on}
                >
                  <span className="text-sm font-extrabold text-sun">0{i + 1}</span>
                  <h3 className="mt-2 max-w-md text-2xl font-extrabold leading-tight md:text-[32px]">{card.title}</h3>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/85 md:text-base">{card.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
