import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";

export async function GET(request: Request) {
  const tokenHash = new URL(request.url).searchParams.get("token_hash");
  if (tokenHash) {
    const supabase = await supabaseServer(true);
    if (supabase) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
      if (!error) redirect("/");
    }
  }

  redirect("/daftar?status=tautan");
}
