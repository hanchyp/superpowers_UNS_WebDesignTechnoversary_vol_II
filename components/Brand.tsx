import Image from "next/image";
import { HomeLink } from "./HomeLink";

export function Logo({ tone = "color", size = "md", wordmark = false, decorative = false }: {
  tone?: "color" | "white";
  size?: "sm" | "md" | "lg" | "intro";
  wordmark?: boolean;
  decorative?: boolean;
}) {
  const dimension = size === "intro" ? 280 : size === "lg" ? 72 : size === "sm" ? 52 : 48;
  const mark = (
    <>
      <Image
        src="/wana-logo-transparent.png"
        alt=""
        width={dimension}
        height={dimension}
        sizes={`${dimension}px`}
        className={`shrink-0 object-contain ${tone === "white" ? "brightness-0 invert" : ""}`}
      />
      {wordmark && (
        <span className={`text-[30px] font-extrabold leading-none tracking-[-0.04em] ${tone === "white" ? "text-white" : "text-forest"}`}>
          wana
        </span>
      )}
    </>
  );
  return decorative ? (
    <span aria-hidden="true" className="inline-flex shrink-0 items-center gap-1.5">{mark}</span>
  ) : (
    <HomeLink className="inline-flex shrink-0 items-center gap-1.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4" ariaLabel="WANA, ke beranda">{mark}</HomeLink>
  );
}

export function SimBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 font-mono text-[11px] font-medium text-white ${className}`}
    >
      <span className="h-[7px] w-[7px] rounded-full bg-sun" />
      Data simulasi
    </span>
  );
}
