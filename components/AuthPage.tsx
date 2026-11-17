import Image from "next/image";
import type { ReactNode } from "react";
import { Logo } from "@/components/Brand";

export function AuthPage({ title, description, children, back }: {
  title: string;
  description: string;
  children: ReactNode;
  /** Tautan kembali kecil di paling atas, terpisah dari aksi form. */
  back?: ReactNode;
}) {
  return (
    <main className="grid min-h-[100svh] md:grid-cols-2">
      <div className="relative hidden md:block">
        <Image src="/photos/hutan-lestari.jpg" alt="Hutan tropis Indonesia" fill sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/85 to-transparent" />
        <p className="absolute bottom-12 left-12 max-w-[420px] text-4xl font-extrabold leading-tight tracking-[-0.03em] text-white">
          Satu foto darimu bisa bantu banyak orang bersiap.
        </p>
      </div>
      <div className="flex flex-col justify-center px-6 py-10 md:px-16">
        {back && <div className="mb-8 min-h-5">{back}</div>}
        <Logo />
        <h1 className="mt-10 text-3xl font-extrabold tracking-[-0.02em]">{title}</h1>
        <p className="mt-2 text-base font-medium text-ink-2">{description}</p>
        {children}
      </div>
    </main>
  );
}
