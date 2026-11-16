import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfig } from "@/lib/supabase";

/** Halaman yang hanya boleh dibuka setelah masuk. */
const protectedPrefixes = ["/lapor", "/laporan-saya"];

function isProtected(pathname: string) {
  return protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function toLogin(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const url = request.nextUrl.clone();
  url.pathname = "/masuk";
  url.search = new URLSearchParams({ kembali: pathname + search }).toString();
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const config = supabaseConfig();
  const needsLogin = isProtected(request.nextUrl.pathname);
  let response = NextResponse.next({ request });
  const hasSessionCookie = request.cookies.getAll().some(({ name }) => /^sb-.+-auth-token(?:\.\d+)?$/.test(name));

  if (!config) return response;
  if (!hasSessionCookie) return needsLogin ? toLogin(request) : response;

  const supabase = createServerClient(config.url, config.key, {
    cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === "production" },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        for (const { name, value } of cookies) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookies) response.cookies.set(name, value, options);
        response.headers.set("Cache-Control", "private, no-store");
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  if (needsLogin && !data?.claims.sub) return toLogin(request);
  return response;
}

export const config = {
  matcher: ["/((?!auth/confirm|_next/|favicon.ico|.*\\.[^/]+$).*)"],
};
