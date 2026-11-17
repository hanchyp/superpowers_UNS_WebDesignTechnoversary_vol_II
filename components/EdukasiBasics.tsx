"use client";

import { motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Slide = { title: string; lead: string; body: string; tone: string };

const CHAPTER = "Mengapa hutan penting?";

// Warna latar tiap slide dari palet WANA, sama seperti kartu di beranda.
const slides: Slide[] = [
  {
    title: "Hutan menjaga udara kita",
    lead: "Penyerap dan penyimpan karbon",
    body: "Pohon menyerap karbon dioksida untuk tumbuh dan menyimpannya di batang, akar, serta tanah. Lahan gambut bahkan menyimpan karbon jauh lebih banyak per hektare dibanding tanah biasa. Saat hutan terbakar, karbon yang tersimpan puluhan sampai ratusan tahun itu lepas kembali ke udara.",
    tone: "bg-sprout",
  },
  {
    title: "Hutan menjaga air",
    lead: "Spons raksasa di hulu sungai",
    body: "Tajuk dan akar pohon menahan air hujan agar meresap pelan ke tanah, tidak langsung mengalir ke permukiman. Air ini mengisi sumur dan sungai saat kemarau, sekaligus mengurangi banjir dan longsor saat musim hujan. Gambut basah pun bisa menampung air berkali lipat dari beratnya.",
    tone: "bg-sky-soft",
  },
  {
    title: "Rumah bagi banyak makhluk",
    lead: "Keanekaragaman hayati Indonesia",
    body: "Indonesia termasuk negara dengan keanekaragaman hayati terkaya di dunia. Hutan menjadi rumah orang utan, harimau sumatra, gajah, rangkong, dan ribuan jenis tumbuhan yang tidak ada di tempat lain. Saat hutan terpecah, satwa makin sulit mencari makan dan pasangan.",
    tone: "bg-sun-soft",
  },
  {
    title: "Sumber hidup warga",
    lead: "Pangan, obat, dan penghidupan",
    body: "Jutaan orang, termasuk masyarakat adat dan desa di sekitar hutan, bergantung pada hutan untuk pangan, obat-obatan, madu, rotan, dan kayu bakar. Banyak komunitas juga punya aturan adat untuk menjaga hutannya. Menjaga hutan berarti menjaga penghidupan mereka.",
    tone: "bg-earth-soft",
  },
];

/** Pohon bulat dilihat dari atas: lingkaran daun berlapis seperti roset. */
function RoundTree({ className = "" }: { className?: string }) {
  const rings = [
    { len: 200, n: 14, w: 50, fill: "#245c35", offset: 0 },
    { len: 172, n: 13, w: 46, fill: "#2f6f40", offset: 13 },
    { len: 142, n: 12, w: 41, fill: "#3f864c", offset: 4 },
    { len: 112, n: 10, w: 35, fill: "#5aa25d", offset: 18 },
    { len: 82, n: 9, w: 28, fill: "#7dbb6f", offset: 8 },
    { len: 52, n: 7, w: 20, fill: "#a6d68f", offset: 25 },
  ];
  const leaf = (len: number, w: number) =>
    `M0 0C${w} ${-len * 0.28} ${w * 0.82} ${-len * 0.74} 0 ${-len}C${-w * 0.82} ${-len * 0.74} ${-w} ${-len * 0.28} 0 0Z`;
  return (
    <svg viewBox="-220 -220 440 440" className={className} aria-hidden="true">
      {rings.map((ring, r) =>
        Array.from({ length: ring.n }, (_, i) => (
          <g key={`${r}-${i}`} transform={`rotate(${(360 / ring.n) * i + ring.offset})`}>
            <path d={leaf(ring.len, ring.w)} fill={ring.fill} stroke="#13261b" strokeOpacity="0.12" strokeWidth="1.5" />
            <path d={`M0 ${-ring.len * 0.12}L0 ${-ring.len * 0.86}`} stroke="#ffffff" strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" />
          </g>
        )),
      )}
      <circle r="16" fill="#c9e9b4" />
      <circle r="7" fill="#7dbb6f" />
    </svg>
  );
}

function SlidePanel({ slide, index }: { slide: Slide; index: number }) {
  return (
    <div>
      <div className="flex items-start gap-4 md:gap-6">
        <span className="text-[44px] font-extrabold leading-none tracking-[-0.04em] text-leaf md:text-[64px]">{String(index + 1).padStart(2, "0")}</span>
        <div className="min-w-0 pt-1">
          <h3 className="text-[24px] font-extrabold leading-[1.1] tracking-[-0.03em] text-forest md:text-[34px]">{slide.title}</h3>
          <p className="mt-1.5 text-[15px] font-bold text-earth md:text-[17px]">{slide.lead}</p>
        </div>
      </div>
      <p className="mt-5 max-w-[60ch] text-base font-medium leading-relaxed text-ink-2 md:mt-6 md:text-[17px]">{slide.body}</p>
    </div>
  );
}

const HEADER_OFFSET = () => (window.matchMedia("(min-width: 768px)").matches ? 72 : 64);
/** Putaran pohon dari slide pertama sampai terakhir. */
const TREE_TURN = 270;

export function EdukasiBasics() {
  const section = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const tree = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  // Layar terlalu pendek: tampilkan sebagai daftar biasa.
  const [isStatic, setIsStatic] = useState(false);
  const [measure, setMeasure] = useState(0);

  useLayoutEffect(() => {
    if (isStatic || !content.current) return;
    if (content.current.offsetHeight + 32 > window.innerHeight - HEADER_OFFSET()) setIsStatic(true);
  }, [isStatic, measure]);

  // Seperti "Dengan WANA, kamu bisa": panggung menempel, slide berganti dan pohon berputar halus mengikuti gulir.
  useEffect(() => {
    const sectionEl = section.current;
    if (!sectionEl) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const stageEl = stage.current;
      if (!stageEl) return;
      const bounds = sectionEl.getBoundingClientRect();
      const distance = bounds.height - stageEl.offsetHeight;
      const progress = distance > 0 ? Math.max(0, Math.min(1, (HEADER_OFFSET() - bounds.top) / distance)) : 0;
      setActive(Math.min(slides.length - 1, Math.floor(progress * slides.length)));
      if (tree.current) tree.current.style.transform = `rotate(${progress * TREE_TURN}deg)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      setIsStatic(false);
      setMeasure((m) => m + 1);
      onScroll();
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Titik penanda: gulir ke bagian tengah slide yang dipilih.
  const goTo = (i: number) => {
    const sectionEl = section.current;
    const stageEl = stage.current;
    if (!sectionEl || !stageEl) return;
    const distance = sectionEl.offsetHeight - stageEl.offsetHeight;
    const top = sectionEl.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET();
    window.scrollTo({ top: top + (distance * (i + 0.5)) / slides.length, behavior: "smooth" });
  };

  const slide = slides[active];

  const list = (
    <div className="mx-auto max-w-[900px] px-5 py-12 md:px-8">
      <p className="mb-8 text-center text-3xl font-extrabold tracking-tight md:text-4xl">{CHAPTER}</p>
      <ol className="space-y-4">
        {slides.map((s, i) => (
          <li key={s.title} className={`rounded-[28px] border-2 border-forest p-5 md:p-8 ${s.tone}`}>
            <SlidePanel slide={s} index={i} />
          </li>
        ))}
      </ol>
    </div>
  );

  return (
    <div ref={section} className={isStatic ? "pt-6 md:pt-10" : "relative pt-10 motion-safe:min-h-[calc(100svh+120svh)] md:pt-16"}>
      <h2 id="bacaan" className="sr-only">
        {CHAPTER}
      </h2>

      {isStatic ? (
        list
      ) : (
        <>
          <div
            ref={stage}
            className="flex items-center overflow-hidden py-8 motion-safe:sticky motion-safe:top-16 motion-safe:h-[calc(100svh-4rem)] motion-reduce:hidden md:motion-safe:top-[72px] md:motion-safe:h-[calc(100svh-72px)]"
            aria-hidden="true"
          >
            <div ref={content} className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
              <p className="mb-8 text-center text-3xl font-extrabold tracking-tight md:mb-12 md:text-4xl">{CHAPTER}</p>
              <div className="relative">
              {/* Pohon: di HP mengintip di kanan atas, di desktop besar menempel ke tepi kiri panel */}
              <div className="pointer-events-none absolute -right-12 -top-16 z-10 w-32 md:-left-24 md:right-auto md:top-1/2 md:w-[500px] md:-translate-y-1/2 lg:-left-16">
                <div ref={tree} className="transition-transform duration-200 ease-out will-change-transform">
                  <RoundTree className="h-auto w-full drop-shadow-[0_18px_30px_rgb(10_58_33/0.35)]" />
                </div>
              </div>

              <div className={`relative rounded-[32px] border-2 border-forest px-5 pb-6 pt-7 shadow-[0_10px_28px_-8px_rgba(0,0,0,0.22)] transition-colors duration-500 md:ml-[200px] md:rounded-[40px] md:py-12 md:pl-[230px] md:pr-12 lg:ml-[220px] ${slide.tone}`}>
                <motion.div
                  key={active}
                  initial={active === 0 ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <SlidePanel slide={slide} index={active} />
                </motion.div>
                <div className="mt-6 flex items-center gap-2 md:mt-8">
                  {slides.map((s, i) => (
                    <button
                      key={s.title}
                      type="button"
                      tabIndex={-1}
                      onClick={() => goTo(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${i === active ? "w-7 bg-forest" : "w-2 bg-forest/25 hover:bg-forest/50"}`}
                    />
                  ))}
                </div>
              </div>
              </div>
            </div>
          </div>
          {/* Untuk pembaca layar dan pengguna "kurangi gerakan" */}
          <div className="motion-safe:sr-only">{list}</div>
        </>
      )}
    </div>
  );
}
