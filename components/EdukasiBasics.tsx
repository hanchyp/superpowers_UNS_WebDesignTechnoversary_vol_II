"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Topic = {
  title: string;
  body: string;
  mascot: string;
  mascotAlt: string;
  flip?: boolean;
  accent: "fire" | "peat" | "hotspot";
};

const topics: Topic[] = [
  {
    title: "Apa itu karhutla?",
    body: "Karhutla adalah singkatan dari kebakaran hutan dan lahan. Kebakaran bisa terjadi di kawasan berhutan maupun di lahan terbuka. Saat vegetasi kering terbakar, api dapat menjalar ke area sekitarnya dan asap bisa terbawa angin melampaui lokasi kebakaran.",
    mascot: "/mascot/guide.png",
    mascotAlt: "Maskot orang utan WANA sedang menjelaskan",
    accent: "fire",
  },
  {
    title: "Mengapa gambut sulit dipadamkan?",
    body: "Gambut terbentuk dari sisa tumbuhan yang menumpuk. Ketika mengering dan terbakar, bara bisa merambat di bawah permukaan. Padamnya api yang terlihat di permukaan belum cukup untuk memastikan bara di bawahnya sudah padam.",
    mascot: "/mascot/care.png",
    mascotAlt: "Maskot orang utan WANA memegang tunas",
    flip: true,
    accent: "peat",
  },
  {
    title: "Apa arti titik panas di peta?",
    body: "Titik panas atau hotspot menandai area pada citra satelit yang suhunya melewati ambang tertentu. Temuan ini menjadi petunjuk awal untuk memeriksa kemungkinan kebakaran di lapangan.",
    mascot: "/mascot/observe.png",
    mascotAlt: "Maskot orang utan WANA mengamati dengan teropong",
    accent: "hotspot",
  },
];

/** Daun berurat, dipakai sebagai hiasan putih di sudut kartu. */
function VeinLeaf({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 140" className={className} aria-hidden="true">
      <path d="M50 4C84 30 96 78 50 136C4 78 16 30 50 4Z" fill="currentColor" />
      <g stroke="var(--color-forest)" strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M50 18V128" />
        <path d="M50 44L30 30M50 44L70 30M50 66L24 50M50 66L76 50M50 88L28 74M50 88L72 74M50 108L36 98M50 108L64 98" />
      </g>
    </svg>
  );
}

/** Ranting kecil dengan daun, hiasan di sekitar maskot. */
function Sprig({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 90" className={className} aria-hidden="true">
      <path d="M30 88C30 60 28 36 34 6" stroke="var(--color-forest)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M31 62C18 60 10 50 9 40C21 41 30 50 31 62Z" fill="var(--color-leaf)" />
      <path d="M31 46C43 44 51 34 52 24C40 25 31 34 31 46Z" fill="var(--color-moss)" />
      <path d="M32 28C22 25 17 17 17 9C27 11 32 18 32 28Z" fill="var(--color-leaf)" />
    </svg>
  );
}

const blobPath =
  "M44.7,-61.4C57.2,-52.3,66.1,-38.5,70.6,-23.4C75.1,-8.3,75.2,8.1,69.6,22.2C64,36.3,52.7,48.1,39.3,57.4C25.9,66.7,10.4,73.5,-5.4,75.9C-21.2,78.3,-37.3,76.3,-49.6,67.7C-61.9,59.1,-70.4,43.9,-73.6,28.1C-76.8,12.3,-74.7,-4.1,-69.2,-18.9C-63.7,-33.7,-54.8,-46.9,-42.6,-56.3C-30.4,-65.7,-15.2,-71.3,0.4,-71.9C16,-72.5,32.2,-70.5,44.7,-61.4Z";

function Accent({ kind }: { kind: Topic["accent"] }) {
  if (kind === "fire") {
    return (
      <>
        {/* Kepulan asap */}
        <svg viewBox="0 0 120 60" className="absolute right-[6%] top-[8%] w-24 md:w-28" aria-hidden="true">
          <g fill="var(--color-smoke-soft)" stroke="var(--color-smoke)" strokeOpacity="0.35" strokeWidth="1.5">
            <circle cx="30" cy="38" r="16" />
            <circle cx="56" cy="28" r="20" />
            <circle cx="86" cy="36" r="15" />
          </g>
        </svg>
        <span className="absolute bottom-[14%] left-[10%] grid h-12 w-12 place-items-center rounded-full bg-sun text-forest shadow-[0_6px_14px_-6px_rgb(163_106_0/0.6)]">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3c1 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-1.6.6-2.7 1.5-3.6.2 1.4.9 2.2 1.8 2.6C11 8 11 5.5 12 3Z" />
          </svg>
        </span>
      </>
    );
  }
  if (kind === "peat") {
    return (
      <div className="absolute inset-x-[12%] bottom-[6%] h-10 overflow-hidden rounded-full" aria-hidden="true">
        <span className="absolute inset-x-0 top-0 h-1/3 bg-moss" />
        <span className="absolute inset-x-0 top-1/3 h-1/3 bg-earth/70" />
        <span className="absolute inset-x-0 bottom-0 h-1/3 bg-earth" />
        <span className="absolute left-[30%] top-[55%] h-2 w-2 rounded-full bg-sun" />
        <span className="absolute left-[62%] top-[75%] h-1.5 w-1.5 rounded-full bg-fire" />
      </div>
    );
  }
  return (
    <>
      <span className="absolute right-[12%] top-[14%] grid h-16 w-16 place-items-center" aria-hidden="true">
        <span className="absolute inset-0 rounded-full border-2 border-dashed border-fire/40" />
        <span className="absolute inset-3 rounded-full border-2 border-fire/50" />
        <span className="h-4 w-4 rounded-full bg-fire ring-4 ring-fire-soft" />
      </span>
      <span className="absolute bottom-[16%] left-[8%] h-3 w-3 rounded-full bg-sun" aria-hidden="true" />
      <span className="absolute bottom-[26%] left-[16%] h-2 w-2 rounded-full bg-fire/70" aria-hidden="true" />
    </>
  );
}

function Illustration({ topic }: { topic: Topic }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[340px]">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d={blobPath} transform="translate(100 104) scale(1.25)" fill="var(--color-sprout)" />
        <path d={blobPath} transform="translate(104 112) scale(0.95) rotate(40)" fill="var(--color-moss)" opacity="0.45" />
      </svg>
      <Accent kind={topic.accent} />
      <Sprig className={`absolute bottom-[10%] w-10 md:w-12 ${topic.flip ? "left-[6%]" : "right-[6%]"}`} />
      <Image
        src={topic.mascot}
        alt={topic.mascotAlt}
        width={300}
        height={300}
        sizes="(min-width: 768px) 260px, 220px"
        className={`relative mx-auto mt-[6%] h-[82%] w-[82%] object-contain ${topic.flip ? "-scale-x-100" : ""}`}
      />
    </div>
  );
}

function LeafCard({ topic, index, cardLeft }: { topic: Topic; index: number; cardLeft: boolean }) {
  return (
    <article
      className={`relative overflow-hidden bg-gradient-to-br from-forest to-leaf p-6 text-white md:p-9 ${
        cardLeft ? "rounded-[28px] rounded-tl-[96px] rounded-br-[96px]" : "rounded-[28px] rounded-tr-[96px] rounded-bl-[96px]"
      }`}
    >
      <VeinLeaf className={`absolute -bottom-10 h-40 w-28 text-white/15 ${cardLeft ? "-left-6 -rotate-[30deg]" : "-right-6 rotate-[30deg]"}`} />
      <span className="text-sm font-bold text-sprout">0{index + 1}</span>
      <h3 className="mt-1 text-[22px] font-extrabold leading-tight md:text-[28px]">{topic.title}</h3>
      <p className="relative mt-2.5 text-[15px] leading-relaxed text-white/85 md:mt-3 md:text-base">{topic.body}</p>
    </article>
  );
}

function Heading() {
  return (
    <div className="text-center">
      <h2 id="bacaan" className="text-3xl font-extrabold tracking-tight md:text-4xl">
        Dasar-dasar karhutla
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-ink-2 md:mt-3">Tiga hal yang perlu kamu tahu sebelum melapor.</p>
    </div>
  );
}

export function EdukasiBasics() {
  const section = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  // Layar terlalu pendek untuk panggung menempel (mis. HP kecil): tampilkan sebagai daftar biasa.
  const [isStatic, setIsStatic] = useState(false);

  // Sama seperti bagian "Dengan WANA, kamu bisa": panggung menempel, isi berganti sesuai posisi gulir.
  useEffect(() => {
    const sectionEl = section.current;
    const stageEl = stage.current;
    if (!sectionEl || !stageEl) return;
    const update = () => {
      const bounds = sectionEl.getBoundingClientRect();
      const stickyTop = parseFloat(getComputedStyle(stageEl).top) || 0;
      const distance = bounds.height - stageEl.offsetHeight;
      const index = distance > 0 ? Math.floor(((stickyTop - bounds.top) / distance) * topics.length) : 0;
      setActive(Math.max(0, Math.min(topics.length - 1, index)));
    };
    // Topik pertama punya teks terpanjang, jadi pengukuran awal mewakili kasus terburuk.
    const fit = () => {
      if (getComputedStyle(stageEl).position !== "sticky") return;
      const stickyTop = parseFloat(getComputedStyle(stageEl).top) || 0;
      if (stageEl.offsetHeight > window.innerHeight - stickyTop) setIsStatic(true);
    };
    const onResize = () => {
      fit();
      update();
    };
    fit();
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const topic = topics[active];
  const cardLeft = active % 2 === 1;

  return (
    <div ref={section} className={`relative ${isStatic ? "" : "motion-safe:min-h-[300svh]"}`}>
      <div
        ref={stage}
        className={`mx-auto grid max-w-[1100px] content-center gap-4 px-5 py-6 md:gap-8 md:px-8 md:py-10 ${
          isStatic
            ? ""
            : "motion-safe:sticky motion-safe:top-16 motion-safe:min-h-[calc(100svh-4rem)] md:motion-safe:top-[72px] md:motion-safe:min-h-[calc(100svh-72px)]"
        }`}
      >
        <Heading />

        {/* Versi animasi */}
        <div className={`motion-reduce:hidden ${isStatic ? "hidden" : ""}`} aria-hidden="true">
          <div className="grid items-center gap-4 md:grid-cols-2 md:gap-14">
            <motion.div
              key={`img-${active}`}
              initial={active === 0 ? false : { opacity: 0, x: cardLeft ? 40 : -40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`mx-auto w-full max-w-[200px] [@media(max-height:760px)]:max-w-[140px] md:max-w-none md:[@media(max-height:760px)]:max-w-[300px] ${cardLeft ? "md:order-2" : ""}`}
            >
              <Illustration topic={topic} />
            </motion.div>
            <motion.div
              key={`card-${active}`}
              initial={active === 0 ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
              className={cardLeft ? "md:order-1" : ""}
            >
              <LeafCard topic={topic} index={active} cardLeft={cardLeft} />
            </motion.div>
          </div>
        </div>

        {/* Versi tanpa animasi (dan untuk pembaca layar) */}
        <ol className={`space-y-10 ${isStatic ? "" : "motion-safe:sr-only"}`}>
          {topics.map((t, i) => (
            <li key={t.title} className="grid items-center gap-6 md:grid-cols-2 md:gap-16">
              <div className={`mx-auto w-full max-w-[200px] md:max-w-none ${i % 2 === 1 ? "md:order-2" : ""}`}>
                <Illustration topic={t} />
              </div>
              <div className={i % 2 === 1 ? "md:order-1" : ""}>
                <LeafCard topic={t} index={i} cardLeft={i % 2 === 1} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
