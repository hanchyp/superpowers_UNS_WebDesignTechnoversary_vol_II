import Image from "next/image";
import Link from "next/link";
import { AccountNav } from "@/components/AccountNav";
import { AuthLink } from "@/components/AuthLink";
import { EmergencyStrip, SiteFooter } from "@/components/Chrome";
import { HeroVideo } from "@/components/HeroVideo";
import { Icon } from "@/components/Icon";
import { LandingAbilities } from "@/components/LandingAbilities";
import { LandingIntro } from "@/components/LandingIntro";
import { LandingNav } from "@/components/LandingNav";
import { LandingScrollMotion } from "@/components/LandingScrollMotion";
import { LandingReportPreview } from "@/components/LandingReportPreview";
import { RegionalMap } from "@/components/Map";
import { IncidentTags } from "@/components/Status";
import { getIncident } from "@/lib/incidents";

const steps = [
  { n: "1", title: "Amati", text: "Lihat asap atau api? Potret dari tempat aman dan tandai lokasi atau arahnya.", bg: "bg-sun" },
  { n: "2", title: "Diperiksa", text: "AI memeriksa foto, waktu, dan lokasi. Lolos berarti layak tampil, belum berarti terverifikasi.", bg: "bg-sky" },
  { n: "3", title: "Dilengkapi", text: "Laporanmu tampil di peta dan warga lain bisa menambah pengamatan di kejadian yang sama.", bg: "bg-moss" },
];

const landingCardStyle = "rounded-3xl border-2 border-forest shadow-[0_10px_28px_-8px_rgba(0,0,0,0.22)]";

export default function Home() {
  const featured = getIncident("pulang-pisau")!;
  const recent = ["pulang-pisau", "ketapang", "banjar"].map((id) => getIncident(id)!);

  return (
    <LandingIntro>
      <LandingScrollMotion />
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden md:min-h-[780px]">
        <Image
          src="/photos/rawa-gambut-udara.jpg"
          alt="Foto udara hutan rawa gambut dan sungai berwarna teh di Kalimantan"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover saturate-[1.2]"
        />
        <HeroVideo />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0a1c12]/78 via-[#0a1c12]/65 to-[#0a1c12]/85" />
        <LandingNav
          desktopAccount={
            <AccountNav
              tone="dark"
              signedOut={
                <>
                  <AuthLink href="/masuk" className="text-base font-bold text-white">Masuk</AuthLink>
                  <AuthLink href="/daftar" className="rounded-full bg-white px-5 py-2.5 text-base font-bold text-forest hover:bg-sprout">Daftar</AuthLink>
                </>
              }
            />
          }
          mobileName={
            <div className="ml-auto mr-3 md:hidden">
              <AccountNav tone="dark" compact />
            </div>
          }
          mobileAccount={
            <AccountNav
              showSignedIn={false}
              signedOut={
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <AuthLink href="/masuk" className="btn-outline py-3">Masuk</AuthLink>
                  <AuthLink href="/daftar" className="btn-primary py-3">Daftar</AuthLink>
                </div>
              }
            />
          }
        />
        <div className="mx-auto flex w-full max-w-[900px] flex-col items-center px-6 pb-16 pt-28 text-center">
          <h1 className="mt-6 text-[40px] font-extrabold leading-[1.12] tracking-[-0.03em] text-white sm:text-6xl md:text-[72px] md:leading-[1.1]">
            Pantau hutan.
            <br />
            Bagikan <span className="text-sun">pengamatan.</span>
          </h1>
          <p className="mt-5 max-w-[640px] text-[17px] font-medium leading-[1.6] text-[#e6f0e2] md:text-[21px]">
            Laporkan indikasi asap atau api, lihat perkembangan wilayah, dan bantu lengkapi informasi dari pengamatanmu.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/lapor" className="btn bg-sun px-7 py-4 text-lg font-extrabold text-forest hover:bg-[#ffd666]">
              <Icon name="plus" size={22} />
              Laporkan pengamatan
            </Link>
            <Link href="/pantau" className="btn-ghost-light px-7 py-4 text-lg font-extrabold">
              <Icon name="map" size={22} />
              Buka peta
            </Link>
          </div>
        </div>
      </section>

      {/* Kemampuan */}
      <LandingAbilities />

      {/* Contoh satu pengamatan */}
      <section id="cerita" className="px-5 py-14 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <h2 data-landing-reveal="text" className="text-[28px] font-extrabold leading-tight tracking-[-0.025em] md:text-center md:text-[40px]">
            Setiap pengamatan punya cerita
          </h2>
          <LandingReportPreview incident={featured} className={landingCardStyle} />
        </div>
      </section>

      {/* Kejadian terbaru */}
      <section className="bg-tint py-14 md:py-24">
        <div className="mx-auto max-w-[1312px]">
          <div className="flex items-end justify-between px-5 md:px-8">
            <div>
              <h2 data-landing-reveal="text" className="text-[26px] font-extrabold tracking-[-0.03em] md:text-[46px]">Kejadian terbaru</h2>
            </div>
            <Link href="/pantau" className="btn border-2 border-forest bg-white px-5 py-3 text-[15px] text-forest">
              <span className="hidden sm:inline">Buka peta lengkap</span>
              <span className="sm:hidden">Peta</span>
              <Icon name="arrowRight" size={18} />
            </Link>
          </div>
          <div className="mt-7 flex snap-x gap-4 overflow-x-auto px-5 pb-8 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-8">
            {recent.map((i, index) => (
              <Link
                key={i.id}
                data-landing-reveal="slide"
                data-motion-order={index}
                href={`/kejadian/${i.id}`}
                className={`${landingCardStyle} w-[280px] shrink-0 snap-start overflow-hidden bg-white transition hover:-translate-y-1 md:w-auto`}
              >
                <RegionalMap focus={i} items={[i]} showTowns={false} className="h-36 border-b-2 border-forest md:h-48" />
                <div className="flex flex-col gap-2.5 p-4 md:p-5">
                  <p className="font-sans text-xs font-semibold text-earth">
                    {i.region} · {i.updatedAgo}
                  </p>
                  <h3 className="text-base font-extrabold leading-snug md:text-xl">{i.title}</h3>
                  <IncidentTags incident={i} showEvidence={false} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tiga langkah */}
      <section id="edukasi" className="overflow-hidden bg-sky-soft px-5 py-14 md:py-20">
        <div className="relative mx-auto max-w-[1600px] text-center xl:px-[200px] 2xl:px-[240px]">
          <div aria-hidden="true" className="pointer-events-none absolute left-0 top-1/2 hidden w-[190px] -translate-y-1/2 xl:block 2xl:w-[230px]">
            <Image src="/mascot/guide.png" alt="" width={280} height={280} sizes="(min-width: 1536px) 230px, (min-width: 1280px) 190px, 128px" className="h-auto w-full object-contain" />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 hidden w-[190px] -translate-y-1/2 xl:block 2xl:w-[230px]">
            <Image src="/mascot/care.png" alt="" width={280} height={280} sizes="(min-width: 1536px) 230px, (min-width: 1280px) 190px, 128px" className="h-auto w-full object-contain" />
          </div>
          <h2 data-landing-reveal="text" className="text-[28px] font-extrabold tracking-[-0.025em] md:text-[40px]">Semudah tiga langkah</h2>
          <ol className="mt-9 grid gap-9 md:grid-cols-3 md:gap-10">
            {steps.map((s, index) => (
              <li key={s.n} className="relative flex flex-col items-center gap-3">
                {index !== 1 && (
                  <Image
                    src={index === 0 ? "/mascot/guide.png" : "/mascot/care.png"}
                    alt=""
                    width={72}
                    height={72}
                    className={`pointer-events-none absolute -top-2 h-16 w-16 object-contain sm:h-[72px] sm:w-[72px] xl:hidden ${index === 0 ? "right-[calc(50%+64px)]" : "left-[calc(50%+64px)]"}`}
                  />
                )}
                <span data-landing-reveal="stamp" data-motion-order={index} className={`grid h-14 w-14 place-items-center rounded-full border-2 border-forest ${s.bg} text-2xl font-extrabold text-forest md:h-16 md:w-16 md:text-[28px]`}>
                  {s.n}
                </span>
                <h3 data-landing-reveal="slide" data-motion-order={index + 1} className="text-[22px] font-extrabold md:text-[26px]">{s.title}</h3>
                <p data-landing-reveal="slide" data-motion-order={index + 2} className="max-w-[340px] text-base font-medium leading-relaxed text-ink-2 md:text-[17px]">{s.text}</p>
              </li>
            ))}
          </ol>
          <Link href="/pantau" className="btn mt-10 w-full border-2 border-forest bg-leaf px-8 py-4 text-lg font-extrabold text-white sm:w-auto">
            Mulai pantau wilayahmu
          </Link>
        </div>
      </section>

      <EmergencyStrip />
      <SiteFooter />
    </LandingIntro>
  );
}
