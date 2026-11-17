import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import type { FormState } from "@/components/AccountForm";
import { AuthPage } from "@/components/AuthPage";
import { NewPasswordForm } from "@/components/PasswordForms";
import { isDemoEmail } from "@/lib/demo";
import { supabaseServer } from "@/lib/supabase";

export const metadata: Metadata = { title: "Atur password baru" };

const DEMO_LOCKED = "Password akun demo tidak bisa diganti karena dipakai bersama. Daftar akun sendiri untuk mengatur password.";

async function updatePassword(_: FormState, form: FormData): Promise<FormState> {
  "use server";

  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (password.length < 8) return { message: "Password minimal 8 karakter." };
  if (password !== confirm) return { message: "Kedua password belum sama." };

  const supabase = await supabaseServer(true);
  if (!supabase) return { message: "Layanan akun belum dikonfigurasi." };

  // Akun demo dipakai bersama, jadi password-nya tidak boleh diganti dari aplikasi.
  const { data } = await supabase.auth.getClaims();
  if (isDemoEmail(data?.claims.email)) return { message: DEMO_LOCKED };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("[atur-password] updateUser gagal:", error.code ?? error.status, error.message);
    if (error.code === "same_password") return { message: "Password baru harus berbeda dari yang lama." };
    if (error.code === "weak_password") return { message: "Password terlalu lemah. Pakai kombinasi yang lebih panjang." };
    if (error.code === "session_not_found" || error.status === 401) {
      return { message: "Sesi reset sudah berakhir. Minta tautan baru di halaman Lupa password." };
    }
    return { message: "Password belum bisa disimpan. Coba lagi." };
  }

  redirect("/");
}

export default function AturPasswordPage() {
  return (
    <AuthPage title="Atur password baru" description="Buat password baru untuk akun WANA kamu.">
      <Suspense>
        <RequireSession />
      </Suspense>
    </AuthPage>
  );
}

async function RequireSession() {
  await connection();
  const supabase = await supabaseServer();
  const { data } = (await supabase?.auth.getClaims()) ?? { data: null };
  if (!data?.claims.sub) redirect("/lupa-password");
  if (isDemoEmail(data.claims.email)) {
    return <p role="status" className="mt-8 max-w-[420px] rounded-2xl bg-tint p-4 text-forest">{DEMO_LOCKED}</p>;
  }
  return <NewPasswordForm action={updatePassword} />;
}
