import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountForm } from "@/components/AccountForm";
import { AuthPage } from "@/components/AuthPage";
import { loginReturn } from "@/lib/loginReturn";
import { supabaseServer } from "@/lib/supabase";

export const metadata: Metadata = { title: "Masuk" };

const demoEmail = "wana@gmail.com";

export default function MasukPage({ searchParams }: PageProps<"/masuk">) {
  return (
    <AuthPage title="Masuk" description="Gunakan email dan password akun WANA kamu.">
      <Suspense>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </AuthPage>
  );
}

async function LoginForm({ searchParams }: Pick<PageProps<"/masuk">, "searchParams">) {
  const destination = loginReturn((await searchParams).kembali);
  const register = `/daftar?${new URLSearchParams({ kembali: destination })}`;

  async function signIn(_: { message: string }, form: FormData) {
    "use server";

    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || !password) return { message: "Isi email dan password." };

    const supabase = await supabaseServer(true);
    if (!supabase) return { message: "Layanan masuk belum dikonfigurasi." };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("[masuk] signInWithPassword gagal:", error.code ?? error.status, error.message);
      if (error.code === "email_not_confirmed") {
        return { message: "Buka tautan verifikasi di email kamu sebelum masuk." };
      }
      return { message: "Belum bisa masuk. Periksa email dan password, lalu coba lagi." };
    }
    redirect(destination);
  }

  const demoPassword = process.env.WANA_DEMO_PASSWORD;

  return (
    <>
      <AccountForm action={signIn} demo={demoPassword ? { email: demoEmail, password: demoPassword } : undefined} />
      <Link href={register} className="mt-8 text-[15px] font-bold text-leaf">Belum punya akun? Daftar</Link>
      <Link href={destination} className="mt-4 text-[15px] font-bold text-leaf">
        {destination === "/" ? "Kembali ke beranda" : "Kembali ke halaman sebelumnya"}
      </Link>
    </>
  );
}
