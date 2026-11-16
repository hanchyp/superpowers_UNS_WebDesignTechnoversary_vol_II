import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountForm } from "@/components/AccountForm";
import { AuthPage } from "@/components/AuthPage";
import { loginReturn } from "@/lib/loginReturn";
import { supabaseServer } from "@/lib/supabase";

export const metadata: Metadata = { title: "Daftar" };

export default function DaftarPage({ searchParams }: PageProps<"/daftar">) {
  return (
    <AuthPage title="Daftar" description="Buat akun WANA dengan email dan password.">
      <Suspense>
        <Registration searchParams={searchParams} />
      </Suspense>
    </AuthPage>
  );
}

async function Registration({ searchParams }: Pick<PageProps<"/daftar">, "searchParams">) {
  const { kembali, status } = await searchParams;
  const destination = loginReturn(kembali);
  const login = `/masuk?${new URLSearchParams({ kembali: destination })}`;

  async function signUp(_: { message: string }, form: FormData) {
    "use server";

    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!name || name.length > 80 || !email || password.length < 8) {
      return { message: "Isi nama, email, dan password minimal 8 karakter." };
    }

    const supabase = await supabaseServer(true);
    if (!supabase) return { message: "Layanan pendaftaran belum dikonfigurasi." };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error && error.code !== "user_already_exists" && error.code !== "email_exists") {
      return {
        message: error.code === "over_email_send_rate_limit"
          ? "Pengiriman email sedang dibatasi. Coba lagi nanti."
          : "Pendaftaran belum berhasil. Periksa email dan password, lalu coba lagi.",
      };
    }

    if (data?.session) redirect(destination);
    return {
      sent: true,
      message: "Cek kotak masuk atau folder spam untuk tautan verifikasi. Jika email sudah terdaftar, kamu bisa langsung masuk.",
    };
  }

  return (
    <>
      {status === "tautan" && (
        <p role="alert" className="mt-6 text-sm font-semibold text-red-800">
          Tautan verifikasi tidak berlaku atau sudah dipakai. Jika email sudah diverifikasi, silakan masuk.
        </p>
      )}
      <AccountForm action={signUp} register />
      <Link href={login} className="mt-8 text-[15px] font-bold text-leaf">Sudah punya akun? Masuk</Link>
    </>
  );
}
