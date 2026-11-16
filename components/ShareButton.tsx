"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/Icon";

type Props = {
  title: string;
  text?: string;
  /** Path atau URL yang dibagikan. Default: halaman ini. */
  url?: string;
  className?: string;
  /** Isi tombol kustom; `copied` true sesaat setelah tautan disalin. */
  children?: (copied: boolean) => ReactNode;
};

/**
 * Bagikan tautan. Di ponsel memakai lembar bagikan bawaan (Web Share API);
 * di desktop atau browser yang tidak mendukung, salin tautan ke clipboard.
 */
export function ShareButton({ title, text, url, className, children }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function share() {
    const href = new URL(url ?? window.location.href, window.location.origin).toString();
    const data = { title, text, url: href };
    if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        // Pengguna menutup lembar bagikan: jangan lanjut menyalin.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(href);
    } catch {
      window.prompt("Salin tautan ini:", href);
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button type="button" onClick={share} className={className ?? "btn-outline px-4 py-2.5 text-[15px]"}>
      {children ? (
        children(copied)
      ) : (
        <>
          <Icon name={copied ? "check" : "share"} size={18} />
          <span aria-live="polite">{copied ? "Tautan disalin" : "Bagikan"}</span>
        </>
      )}
    </button>
  );
}
