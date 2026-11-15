"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "./Icon";

const abilities: { icon: IconName; title: string; text: string; bg: string }[] = [
  { icon: "map", title: "Melihat", text: "laporan asap dan api di sekitarmu", bg: "bg-white" },
  { icon: "camera", title: "Melaporkan", text: "indikasi yang kamu lihat, dari tempat aman", bg: "bg-sun" },
  { icon: "users", title: "Melengkapi", text: "pengamatan warga lain di kejadian yang sama", bg: "bg-sprout" },
  { icon: "aiCheck", title: "Memahami", text: "seberapa kuat bukti tiap kejadian", bg: "bg-sky-soft" },
];

function AbilityIllustration({ index }: { index: number }) {
  const { bg } = abilities[index];

  return (
    <div aria-hidden="true" className={`relative grid h-40 place-items-center overflow-hidden rounded-2xl border border-forest/15 sm:h-52 lg:h-[clamp(12rem,33svh,20rem)] ${index === 0 ? "bg-sprout" : bg}`}>
      <svg viewBox="0 0 240 160" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-full max-h-64 w-full text-forest">
        {index === 0 && (
          <>
            <path d="M206 62v-20l-5 7m5-7 5 7m-13 8h16" strokeWidth="1.5" />
            <path d="m33 54 53-16 60 15 45-14v77l-45 14-60-15-53 16Z" className="fill-paper" />
            <path d="m34 55 52-16 24 7-21 15-33 4-22 17Zm112 75 45-14V90l-24 5-21 19-18 11Z" className="fill-moss/65" stroke="none" />
            <path d="M37 113c25 0 26-33 51-31 18 2 32 23 51 19 19-4 23-22 49-21" className="stroke-sky" strokeWidth="6" />
            <path d="M86 38v77m60-62v77" className="opacity-35" />
            <path d="M63 101c12-10 23-12 34-8 22 8 33 5 47-8" strokeDasharray="4 5" />
            <circle cx="63" cy="101" r="5" className="fill-moss" />
            <path d="M159 60c0 12-15 25-15 25s-15-13-15-25a15 15 0 0 1 30 0Z" className="fill-sun" />
            <circle cx="144" cy="60" r="4" />
          </>
        )}
        {index === 1 && (
          <>
            <rect x="38" y="55" width="61" height="47" rx="6" transform="rotate(-10 68 79)" className="fill-sprout" />
            <path d="m47 89 13-14 10 7 10-9m-22-9h.1" />
            <path d="M151 60h34m-8-8 8 8-8 8" strokeDasharray="3 4" />
            <rect x="157" y="83" width="47" height="37" rx="8" className="fill-paper" />
            <path d="m173 101 5 5 10-12" className="stroke-leaf" />
            <rect x="82" y="18" width="76" height="124" rx="12" className="fill-paper" />
            <rect x="91" y="40" width="58" height="80" rx="6" className="fill-sun-soft stroke-none" />
            <path d="M111 31h18m-17 98h16" />
            <path d="M101 62h9l4-6h12l4 6h9v30h-38Z" className="fill-sun" />
            <circle cx="120" cy="76" r="8" />
            <path d="M104 104h32" className="opacity-40" />
          </>
        )}
        {index === 2 && (
          <>
            <path d="M61 54c19 0 22 17 42 20m34 13c18 0 22 19 41 19" strokeDasharray="4 5" />
            <rect x="27" y="35" width="45" height="37" rx="8" className="fill-paper" />
            <rect x="166" y="87" width="46" height="37" rx="8" className="fill-sun-soft" />
            <path d="M38 50h23m-23 8h14m126 44h22m-22 8h15" />
            <rect x="87" y="39" width="66" height="85" rx="9" className="fill-paper" />
            <path d="M99 67h42v15H99Z" className="fill-moss stroke-none" />
            <path d="M100 56h28m-28 38h37m-37 10h25" />
            <circle cx="151" cy="41" r="12" className="fill-sun" />
            <path d="M146 41h10m-5-5v10" />
          </>
        )}
        {index === 3 && (
          <>
            <rect x="57" y="43" width="75" height="87" rx="8" transform="rotate(-9 94 87)" className="fill-sprout" />
            <rect x="75" y="31" width="75" height="98" rx="8" className="fill-paper" />
            <path d="M91 51h39m-39 35h19m-19 12h23m-23 11h17" />
            <path d="M92 68h9m5 0h9m5 0h9" className="stroke-leaf" strokeWidth="5" />
            <path d="M166 47h27m-27 9h17m-23-12-5 3 5 3" className="opacity-50" strokeWidth="2" />
            <circle cx="148" cy="96" r="25" className="fill-sun" />
            <circle cx="148" cy="96" r="18" className="fill-sun-soft stroke-none" />
            <path d="m138 96 7 7 12-13m9 24 12 12" />
          </>
        )}
      </svg>
    </div>
  );
}

export function LandingAbilities() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const ability = abilities[activeIndex];

  useEffect(() => {
    const sectionElement = section.current;
    const stageElement = stage.current;
    if (!sectionElement || !stageElement) return;

    const updateStage = () => {
      const bounds = sectionElement.getBoundingClientRect();
      const distance = bounds.height - stageElement.offsetHeight;
      const index = distance > 0 ? Math.floor((-bounds.top / distance) * abilities.length) : 0;
      setActiveIndex(Math.max(0, Math.min(abilities.length - 1, index)));
    };

    updateStage();
    window.addEventListener("scroll", updateStage, { passive: true });
    window.addEventListener("resize", updateStage);
    return () => {
      window.removeEventListener("scroll", updateStage);
      window.removeEventListener("resize", updateStage);
    };
  }, []);

  return (
    <section id="cara-kerja" ref={section} className="bg-tint motion-safe:min-h-[280svh]">
      <div ref={stage} className="mx-auto grid max-w-[1200px] content-center gap-y-6 px-6 py-8 motion-safe:sticky motion-safe:top-0 motion-safe:min-h-svh md:grid-cols-[0.9fr_1.1fr] md:gap-x-12 md:gap-y-10 md:px-10 lg:gap-x-20">
        <Image src="/mascot/guide.png" alt="" width={480} height={480} sizes="(min-width: 1200px) 480px, (min-width: 768px) 40vw, 128px" className="size-28 object-contain sm:size-32 md:col-start-1 md:row-span-2 md:row-start-1 md:h-auto md:max-h-[65svh] md:w-full md:self-center" />
        <h2 className="text-balance text-2xl font-extrabold leading-[1.06] tracking-[-0.035em] text-forest md:col-start-2 md:row-start-1 md:text-4xl lg:text-5xl">Dengan WANA, kamu bisa</h2>

        <div className="min-w-0 motion-reduce:hidden md:col-start-2 md:row-start-2" aria-hidden="true">
          <motion.div
            key={ability.title}
            initial={activeIndex === 0 ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="flex flex-col gap-4 md:gap-5"
          >
            <AbilityIllustration index={activeIndex} />
            <div className="min-h-28 space-y-2 md:min-h-36">
              <h3 className="text-[clamp(2rem,5vw,3.75rem)] font-extrabold leading-none tracking-[-0.035em] text-forest">{ability.title}</h3>
              <p className="max-w-[32ch] text-pretty text-base font-medium leading-relaxed text-ink-2 md:text-xl">{ability.text}</p>
            </div>
          </motion.div>
          <div className="mt-2 flex w-36 gap-1.5">
            {abilities.map(({ title }, index) => (
              <span key={title} className={`h-1 flex-1 rounded-full ${index === activeIndex ? "bg-forest" : "bg-forest/20"}`} />
            ))}
          </div>
        </div>

        <ul className="gap-x-6 gap-y-5 motion-safe:sr-only motion-reduce:grid sm:grid-cols-2 md:col-start-2 md:row-start-2">
          {abilities.map(({ icon, title, text, bg }) => (
            <li key={title} className="flex flex-col items-start gap-2">
              <span className={`grid size-16 place-items-center rounded-full border-2 border-forest text-forest ${bg}`}>
                <Icon name={icon} size={32} />
              </span>
              <h3 className="text-xl font-extrabold">{title}</h3>
              <p className="text-ink-2">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
