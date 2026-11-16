import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountForm, type FormState } from "@/components/AccountForm";
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
  const { kembali, status } = await searchParams;
  const destination = loginReturn(kembali);
  const register = `/daftar?${new URLSearchParams({ kembali: destination })}`;

  async function signIn(_: FormState, form: FormData): Promise<FormState> {
    "use server";

    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || !password) return { message: "Isi email dan password.", email };

    const supabase = await supabaseServer(true);
    if (!supabase) return { message: "Layanan masuk belum dikonfigurasi.", email };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("[masuk] signInWithPassword gagal:", error.code ?? error.status, error.message);
      if (error.code === "email_not_confirmed") {
        return { message: "Buka tautan verifikasi di email kamu sebelum masuk.", email };
      }
      return { message: "Belum bisa masuk. Periksa email dan password, lalu coba lagi.", email };
    }
    redirect(destination);
  }

  async function signInDemo(): Promise<FormState> {
    "use server";

    const password = process.env.WANA_DEMO_PASSWORD;
    const supabase = await supabaseServer(true);
    if (!password || !supabase) return { message: "Akun demo belum disiapkan." };

    const { error } = await supabase.auth.signInWithPassword({ email: demoEmail, password });
    if (error) {
      console.error("[masuk] login demo gagal:", error.code ?? error.status, error.message);
      return { message: "Akun demo sedang tidak bisa dipakai. Coba lagi nanti." };
    }
    redirect(destination);
  }

  const hasDemo = Boolean(process.env.WANA_DEMO_PASSWORD);

  return (
    <>
      {status === "tautan" && (
        <p role="alert" className="mt-6 max-w-[420px] text-sm font-semibold text-red-800">
          Tautan sudah tidak berlaku atau sudah dipakai. Minta tautan baru di halaman Lupa password.
        </p>
      )}
      <AccountForm action={signIn} demoAction={hasDemo ? signInDemo : undefined} />
      <Link href="/lupa-password" className="mt-6 text-[15px] font-bold text-leaf">Lupa password?</Link>
      <Link href={register} className="mt-4 text-[15px] font-bold text-leaf">Belum punya akun? Daftar</Link>
      <Link href={destination} className="mt-4 text-[15px] font-bold text-leaf">
        {destination === "/" ? "Kembali ke beranda" : "Kembali ke halaman sebelumnya"}
      </Link>
    </>
  );
}
