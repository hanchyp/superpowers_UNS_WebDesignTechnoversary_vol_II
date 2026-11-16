import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import type { FormState } from "@/components/AccountForm";
import { AuthPage } from "@/components/AuthPage";
import { ResetRequestForm } from "@/components/PasswordForms";
import { supabaseServer } from "@/lib/supabase";

export const metadata: Metadata = { title: "Lupa password" };

async function requestReset(_: FormState, form: FormData): Promise<FormState> {
  "use server";

  const email = String(form.get("email") ?? "").trim();
  if (!email) return { message: "Isi email akun kamu.", email };

  const supabase = await supabaseServer(true);
  if (!supabase) return { message: "Layanan akun belum dikonfigurasi.", email };

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: host ? `${proto}://${host}/auth/confirm?type=recovery` : undefined,
  });

  if (error) {
    console.error("[lupa-password] resetPasswordForEmail gagal:", error.code ?? error.status, error.message);
    if (error.code === "over_email_send_rate_limit") {
      return { message: "Pengiriman email sedang dibatasi. Coba lagi beberapa menit lagi.", email };
    }
  }

  // Pesan yang sama untuk email terdaftar atau tidak, supaya tidak membocorkan akun.
  return {
    sent: true,
    message: "Jika email itu terdaftar, tautan untuk mengganti password sudah dikirim. Cek kotak masuk atau folder spam.",
  };
}

export default function LupaPasswordPage() {
  return (
    <AuthPage title="Lupa password" description="Masukkan email akun WANA. Kami kirim tautan untuk membuat password baru.">
      <ResetRequestForm action={requestReset} />
      <Link href="/masuk" className="mt-8 text-[15px] font-bold text-leaf">Kembali ke halaman masuk</Link>
    </AuthPage>
  );
}
