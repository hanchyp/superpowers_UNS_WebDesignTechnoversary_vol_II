import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { takeReturn } from "@/lib/returnCookie";
import { supabaseServer } from "@/lib/supabase";

const allowedTypes: EmailOtpType[] = ["email", "signup", "recovery", "email_change", "invite", "magiclink"];

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const tokenHash = params.get("token_hash");
  const rawType = params.get("type") ?? "email";
  const type = allowedTypes.find((t) => t === rawType);
  const isRecovery = type === "recovery";
  const code = params.get("code");

  // Template email bawaan Supabase (PKCE) mengirim ?code=..., bukan token_hash.
  if (code && !tokenHash) {
    const supabase = await supabaseServer(true);
    const { error } = (await supabase?.auth.exchangeCodeForSession(code)) ?? { error: null };
    if (supabase && !error) redirect(isRecovery ? "/atur-password" : await takeReturn());
    if (error) console.error("[auth/confirm] exchangeCodeForSession gagal:", error.code ?? error.status, error.message);
  }

  if (tokenHash && type) {
    const supabase = await supabaseServer(true);
    if (supabase) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      if (!error) {
        // Tautan reset password: sesi sudah aktif, lanjut atur password baru.
        if (isRecovery) redirect("/atur-password");
        redirect(await takeReturn());
      }
      console.error("[auth/confirm] verifyOtp gagal:", type, error.code ?? error.status, error.message);
    }
  }

  redirect(isRecovery ? "/masuk?status=tautan" : "/daftar?status=tautan");
}
