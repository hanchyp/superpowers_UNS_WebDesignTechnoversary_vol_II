import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { siteLinks } from "@/lib/siteLinks";
import { AccountNav } from "./AccountNav";
import { AuthLink } from "./AuthLink";
import { Logo } from "./Brand";
import { Icon } from "./Icon";

/** Bar atas halaman alat (Pantau, Detail, Lapor, Status). */
export function AppBar({ active, search = true }: { active?: "pantau" | "edukasi" | "tentang" | "kontak"; search?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 md:h-[72px] md:gap-7 md:px-7">
        <Logo size="sm" />
        {search && (
          <Form action="/pantau" role="search" className="hidden xl:block">
            <label className="flex h-11 w-[380px] items-center gap-2.5 rounded-full border border-line bg-tint px-4 text-ink-2 focus-within:border-leaf">
              <Icon name="search" size={19} />
              <input
                type="search"
                name="q"
                aria-label="Cari wilayah"
                placeholder="Cari wilayah, misal Pulang Pisau"
                className="w-full bg-transparent text-[15px] font-medium text-ink outline-none placeholder:text-[#6b7d70]"
              />
            </label>
          </Form>
        )}
        <div className="flex-1" />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Utama">
          {siteLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active && l.href === `/${active}` ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[15px] font-semibold ${
                active && l.href === `/${active}` ? "bg-sprout font-bold text-forest" : "text-ink hover:bg-tint"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <AccountNav
          signedOut={<AuthLink href="/masuk" className="whitespace-nowrap text-sm font-bold text-leaf md:text-[15px]">Masuk</AuthLink>}
        />
        <Link href="/lapor" className="btn-report shrink-0 whitespace-nowrap px-4 py-2.5 text-[15px]">
          <Icon name="plus" size={18} />
          <span className="hidden sm:inline">Laporkan pengamatan</span>
          <span className="sm:hidden">Lapor</span>
        </Link>
      </div>
    </header>
  );
}

export function EmergencyStrip() {
  return (
    <section className="border-t-2 border-forest bg-fire-soft">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-4 px-5 py-7 md:flex-row md:items-center md:gap-5 md:px-8">
        <div className="flex items-start gap-4 md:flex-1 md:items-center">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-forest bg-fire text-white md:h-14 md:w-14">
            <Icon name="phone" size={24} />
          </span>
          <div>
            <p className="text-lg font-extrabold text-[#7e1f14] md:text-[21px]">Ada api dekat permukiman atau orang?</p>
            <p className="text-[15px] font-medium text-[#7e1f14] md:text-base">
              Hubungi 112 atau pemadam kebakaran 113 lebih dulu. WANA bukan layanan darurat.
            </p>
          </div>
        </div>
        <a href="tel:112" className="btn border-2 border-forest bg-fire px-6 py-3.5 text-[17px] font-extrabold text-white">
          <Icon name="phone" size={20} />
          Hubungi 112
        </a>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative isolate overflow-hidden text-white">
      <Image src="/photos/sebangau-panorama.jpg" alt="" fill loading="eager" sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-forest/80 via-forest/95 to-forest-deep" />
      <div className="mx-auto max-w-[1312px] px-5 pb-8 pt-14 md:px-8 md:pt-20">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-[720px]">
            <p className="text-3xl font-extrabold leading-tight tracking-[-0.03em] md:text-5xl md:leading-[1.15]">
              Hutan terjaga, mulai dari satu pengamatan kecil.
            </p>
            <Link href="/lapor" className="btn-report mt-7 border-white px-6 py-3.5 text-[17px]">
              <Icon name="plus" size={20} />
              Laporkan pengamatan
            </Link>
          </div>
          <nav aria-label="Menu footer" className="grid grid-cols-2 gap-6 border-t border-white/20 pt-6 md:shrink-0 md:gap-8 md:border-0 md:pt-2 lg:gap-12">
            {["Jelajahi", "WANA"].map((group) => (
              <div key={group} className="min-w-0">
                <h2 className="text-base font-extrabold">{group}</h2>
                <ul className="mt-3 space-y-1 text-[15px] font-semibold text-[#e3f4da]">
                  {siteLinks.filter((link) => link.group === group).map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} className="inline-block py-1.5 underline-offset-4 hover:text-white hover:underline">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
