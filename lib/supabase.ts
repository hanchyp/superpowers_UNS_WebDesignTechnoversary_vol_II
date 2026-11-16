import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}

export async function supabaseServer(writable = false) {
  const config = supabaseConfig();
  if (!config) return null;

  const store = await cookies();
  return createServerClient<Database>(config.url, config.key, {
    cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === "production" },
    cookies: {
      getAll: () => store.getAll(),
      setAll: (cookies) => {
        if (!writable) return;
        for (const { name, value, options } of cookies) store.set(name, value, options);
      },
    },
  });
}
