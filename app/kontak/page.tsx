import type { Metadata } from "next";
import { AppBar, SiteFooter } from "@/components/Chrome";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Kirim pertanyaan dan masukan kepada tim WANA.",
};

export default function KontakPage() {
  return (
    <>
      <AppBar active="kontak" search={false} />
      <main className="bg-tint">
        <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-24">
          <h1 className="text-4xl font-extrabold tracking-tight text-forest md:text-6xl">
            Kontak WANA
          </h1>
          <section className="mt-8 rounded-3xl border border-line bg-white p-6 md:p-8">
            <h2 className="text-2xl font-extrabold">Pertanyaan dan masukan</h2>
            <ContactForm />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
