import Link from "next/link";
import { Icon } from "./Icon";

/** Navigasi bawah mobile, dengan aksi Laporkan di tengah. */
export function MobileTabBar({ active }: { active: "pantau" | "laporan" }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-20 items-start justify-around border-t border-line bg-white px-3 pt-2.5 lg:hidden"
      aria-label="Navigasi bawah"
    >
      <Link href="/pantau" className={`flex w-24 flex-col items-center gap-1 text-xs ${active === "pantau" ? "font-extrabold text-leaf" : "font-semibold text-ink-2"}`}>
        <Icon name="map" size={24} />
        Pantau
      </Link>
      <Link href="/lapor" className="flex w-24 flex-col items-center gap-1 text-xs font-bold text-ink">
        <span className="grid h-[38px] w-14 place-items-center rounded-full border-2 border-forest bg-sun text-forest">
          <Icon name="plus" size={22} />
        </span>
        Laporkan
      </Link>
      <Link href="/laporan-saya/WR-1029" className={`flex w-24 flex-col items-center gap-1 text-xs ${active === "laporan" ? "font-extrabold text-leaf" : "font-semibold text-ink-2"}`}>
        <Icon name="inbox" size={24} />
        Laporan Saya
      </Link>
    </nav>
  );
}
