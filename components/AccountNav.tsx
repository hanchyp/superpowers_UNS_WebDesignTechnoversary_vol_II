import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { supabaseServer } from "@/lib/supabase";
import { ProfileMenu } from "./ProfileMenu";

type Props = {
  /** "dark" untuk di atas foto/hero, "light" untuk bar putih. */
  tone?: "light" | "dark";
  /** Hanya avatar, tanpa nama. */
  compact?: boolean;
  /** Tampilkan apa-apa saat sudah masuk? false = sembunyikan. */
  showSignedIn?: boolean;
  signedOut?: ReactNode;
};

export function AccountNav(props: Props) {
  return (
    <Suspense fallback={props.signedOut}>
      <AccountMenu {...props} />
    </Suspense>
  );
}

async function signOut() {
  "use server";

  const client = await supabaseServer(true);
  await client?.auth.signOut({ scope: "local" });
  redirect("/");
}

async function AccountMenu({ tone, compact, showSignedIn = true, signedOut }: Props) {
  // Klien Supabase membaca sesi dan memakai Date.now() untuk cek kedaluwarsa,
  // jadi bagian ini harus dirender di waktu request, bukan saat prerender.
  await connection();
  const supabase = await supabaseServer();
  if (!supabase) return signedOut;

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) return signedOut;
  if (!showSignedIn) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();
  const rawName: unknown = profile?.full_name ?? data?.claims.user_metadata?.full_name;
  const name = typeof rawName === "string" && rawName.trim() ? rawName.trim() : "Akun WANA";
  const email = typeof data?.claims.email === "string" ? data.claims.email : undefined;

  return <ProfileMenu name={name} email={email} signOut={signOut} tone={tone} compact={compact} />;
}
